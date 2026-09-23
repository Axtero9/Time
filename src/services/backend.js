import { supabase } from "./supabaseClient";

const LOCAL_CACHE_KEY = "time_moves_slow_real_boxes";

/**
 * Fetch all boxes from Supabase with their members and media
 */
export async function fetchBoxesFromBackend(_user) {
  try {
    const { data: boxesData, error: boxesError } = await supabase
      .from("boxes")
      .select("*")
      .order("created_at", { ascending: false });

    if (boxesError) throw boxesError;

    if (!boxesData || boxesData.length === 0) {
      return getCachedBoxes();
    }

    // Fetch members and media in parallel
    const boxIds = boxesData.map((b) => b.id);

    const [membersRes, mediaRes] = await Promise.all([
      supabase.from("box_members").select("*").in("box_id", boxIds),
      supabase.from("box_media").select("*").in("box_id", boxIds).order("created_at", { ascending: true })
    ]);

    const membersByBox = (membersRes.data || []).reduce((acc, m) => {
      if (!acc[m.box_id]) acc[m.box_id] = [];
      acc[m.box_id].push({
        id: m.id,
        userId: m.user_id,
        name: m.name,
        email: m.email,
        avatar: m.avatar || "👤",
        color: m.color || "#2383e2",
        isOwner: m.is_owner,
        agreedToEarlyUnlock: m.agreed_to_early_unlock
      });
      return acc;
    }, {});

    const mediaByBox = (mediaRes.data || []).reduce((acc, m) => {
      if (!acc[m.box_id]) acc[m.box_id] = [];
      acc[m.box_id].push({
        id: m.id,
        type: m.type || "photo",
        url: m.url,
        caption: m.caption,
        date: m.date,
        uploadedBy: m.uploaded_by,
        size: m.size,
        tags: m.tags || []
      });
      return acc;
    }, {});

    const enrichedBoxes = boxesData.map((box) => ({
      id: box.id,
      name: box.name,
      emoji: box.emoji,
      cover: box.cover,
      createdAt: box.created_at,
      duration: box.duration,
      durationLabel: box.duration_label,
      unlockDate: box.unlock_date,
      mode: box.mode,
      status: box.status,
      ownerId: box.owner_id,
      curation: box.curation,
      members: membersByBox[box.id] || [],
      media: mediaByBox[box.id] || []
    }));

    setCachedBoxes(enrichedBoxes);
    return enrichedBoxes;
  } catch (err) {
    console.warn("Backend fetch failed, using local cache:", err);
    return getCachedBoxes();
  }
}

/**
 * Create a new Box in Supabase
 */
export async function createBoxInBackend(boxData, user) {
  const boxId = `box-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const now = new Date();

  let unlockDate;
  let durationLabel;

  if (boxData.duration === "1_month") {
    unlockDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    durationLabel = "1 Month";
  } else if (boxData.duration === "3_months") {
    unlockDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    durationLabel = "3 Months";
  } else if (boxData.duration === "6_months") {
    unlockDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    durationLabel = "6 Months";
  } else if (boxData.duration === "1_year") {
    unlockDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    durationLabel = "1 Year";
  } else if (boxData.duration === "custom" && boxData.durationMinutes) {
    unlockDate = new Date(now.getTime() + boxData.durationMinutes * 60 * 1000);
    durationLabel = `${boxData.durationMinutes} Minutes`;
  } else {
    unlockDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    durationLabel = "1 Year";
  }

  const newBoxRow = {
    id: boxId,
    owner_id: user?.id || null,
    name: boxData.name || "Untitled Box",
    emoji: boxData.emoji || "📦",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    duration: boxData.duration,
    duration_label: durationLabel,
    unlock_date: unlockDate.toISOString(),
    mode: boxData.mode || "shared",
    status: "locked",
    curation: null
  };

  // 1. Insert box row
  try {
    const { error: boxError } = await supabase.from("boxes").insert(newBoxRow);
    if (boxError) console.warn("Supabase box insert error:", boxError);

    // 2. Insert members
    const membersToInsert = (boxData.members || []).map((m) => ({
      box_id: boxId,
      user_id: m.userId || (m.isOwner ? user?.id : null),
      name: m.name,
      email: m.email || null,
      avatar: m.avatar || "👤",
      color: m.color || "#2383e2",
      is_owner: m.isOwner || false,
      agreed_to_early_unlock: false
    }));

    if (membersToInsert.length > 0) {
      await supabase.from("box_members").insert(membersToInsert);
    }

    // 3. Insert initial media
    const mediaToInsert = (boxData.media || []).map((item) => ({
      box_id: boxId,
      user_id: user?.id || null,
      type: item.type || "photo",
      url: item.url,
      caption: item.caption,
      date: item.date,
      uploaded_by: item.uploadedBy || user?.email?.split("@")[0] || "You",
      size: item.size,
      tags: item.tags || []
    }));

    if (mediaToInsert.length > 0) {
      await supabase.from("box_media").insert(mediaToInsert);
    }
  } catch (err) {
    console.warn("Backend error during box creation:", err);
  }

  // Construct local object
  const localBox = {
    id: boxId,
    name: boxData.name || "Untitled Box",
    emoji: boxData.emoji || "📦",
    cover: newBoxRow.cover,
    createdAt: now.toISOString(),
    duration: boxData.duration,
    durationLabel,
    unlockDate: unlockDate.toISOString(),
    mode: boxData.mode || "shared",
    status: "locked",
    ownerId: user?.id || null,
    curation: null,
    members: boxData.members || [
      {
        id: `m-owner-${Date.now()}`,
        name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "You",
        avatar: "👤",
        color: "#2383e2",
        isOwner: true,
        agreedToEarlyUnlock: false
      }
    ],
    media: boxData.media || []
  };

  const cached = getCachedBoxes();
  cached.unshift(localBox);
  setCachedBoxes(cached);
  return localBox;
}

/**
 * Update a Box
 */
export async function updateBoxInBackend(boxId, patch) {
  try {
    const dbPatch = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.emoji !== undefined) dbPatch.emoji = patch.emoji;
    if (patch.cover !== undefined) dbPatch.cover = patch.cover;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.curation !== undefined) dbPatch.curation = patch.curation;

    if (Object.keys(dbPatch).length > 0) {
      await supabase.from("boxes").update(dbPatch).eq("id", boxId);
    }
  } catch (e) {
    console.warn("Update box backend error:", e);
  }

  const cached = getCachedBoxes();
  const idx = cached.findIndex((b) => b.id === boxId);
  if (idx !== -1) {
    cached[idx] = { ...cached[idx], ...patch };
    setCachedBoxes(cached);
    return cached[idx];
  }
  return null;
}

/**
 * Add media items to a Box
 */
export async function addMediaToBackend(boxId, newItems, user) {
  try {
    const rows = newItems.map((item) => ({
      box_id: boxId,
      user_id: user?.id || null,
      type: item.type || "photo",
      url: item.url,
      caption: item.caption,
      date: item.date,
      uploaded_by: item.uploadedBy || user?.user_metadata?.full_name || "You",
      size: item.size,
      tags: item.tags || []
    }));

    await supabase.from("box_media").insert(rows);
  } catch (e) {
    console.warn("Add media backend error:", e);
  }

  const cached = getCachedBoxes();
  const box = cached.find((b) => b.id === boxId);
  if (box) {
    box.media = [...(box.media || []), ...newItems];
    setCachedBoxes(cached);
    return box;
  }
  return null;
}

/**
 * Toggle consensus agreement for a member
 */
export async function toggleVoteInBackend(boxId, memberId, _user) {
  const cached = getCachedBoxes();
  const box = cached.find((b) => b.id === boxId);
  if (!box) return null;

  box.members = box.members.map((m) => {
    if (m.id === memberId) {
      const nextVote = !m.agreedToEarlyUnlock;
      // Sync to supabase
      supabase
        .from("box_members")
        .update({ agreed_to_early_unlock: nextVote })
        .eq("id", memberId)
        .then(() => {})
        .catch(() => {});
      return { ...m, agreedToEarlyUnlock: nextVote };
    }
    return m;
  });

  const allAgreed = box.members.length > 0 && box.members.every((m) => m.agreedToEarlyUnlock);
  if (allAgreed) {
    box.status = "unlocked";
    supabase
      .from("boxes")
      .update({ status: "unlocked" })
      .eq("id", boxId)
      .then(() => {})
      .catch(() => {});
  }

  setCachedBoxes(cached);
  return box;
}

/**
 * Delete Box
 */
export async function deleteBoxFromBackend(boxId) {
  try {
    await supabase.from("boxes").delete().eq("id", boxId);
  } catch (e) {
    console.warn("Delete box backend error:", e);
  }

  const cached = getCachedBoxes().filter((b) => b.id !== boxId);
  setCachedBoxes(cached);
  return cached;
}

// Local cache helpers
function getCachedBoxes() {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCachedBoxes(boxes) {
  try {
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(boxes));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}
