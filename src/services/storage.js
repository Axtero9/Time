// Storage Service for Time Moves Slow
// Manages local persistence for Boxes, Votes, Media Uploads, and AI Curations

import { DEFAULT_BOXES } from "../mock/sampleData";

const STORAGE_KEY = "time_moves_slow_boxes_v1";

/**
 * Initialize and get all boxes from localStorage
 */
export function getBoxes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BOXES));
      return DEFAULT_BOXES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load boxes from localStorage:", e);
    return DEFAULT_BOXES;
  }
}

/**
 * Save boxes array to localStorage
 */
export function saveBoxes(boxes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boxes));
  } catch (e) {
    console.error("Failed to save boxes:", e);
  }
}

/**
 * Get a specific box by ID
 */
export function getBoxById(id) {
  const boxes = getBoxes();
  return boxes.find((b) => b.id === id) || boxes[0] || null;
}

/**
 * Create a new box
 */
export function createBox({ name, emoji, duration, durationMinutes, mode, members, media = [] }) {
  const boxes = getBoxes();
  const now = new Date();
  
  let unlockDate;
  let durationLabel;

  if (duration === "1_min_demo") {
    unlockDate = new Date(now.getTime() + 60 * 1000);
    durationLabel = "1 Minute (Demo)";
  } else if (duration === "1_month") {
    unlockDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    durationLabel = "1 Month";
  } else if (duration === "3_months") {
    unlockDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    durationLabel = "3 Months";
  } else if (duration === "6_months") {
    unlockDate = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);
    durationLabel = "6 Months";
  } else if (duration === "1_year") {
    unlockDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    durationLabel = "1 Year";
  } else if (duration === "custom" && durationMinutes) {
    unlockDate = new Date(now.getTime() + durationMinutes * 60 * 1000);
    durationLabel = `${durationMinutes} Minutes`;
  } else {
    unlockDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    durationLabel = "1 Year";
  }

  const newBox = {
    id: `box-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: name || "Untitled Box",
    emoji: emoji || "📦",
    cover: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop",
    createdAt: now.toISOString(),
    duration,
    durationLabel,
    unlockDate: unlockDate.toISOString(),
    mode: mode || "shared", // "solo" or "shared"
    status: "locked",
    ownerId: "user-me",
    members: members && members.length > 0 ? members : [
      {
        id: "user-me",
        name: "You",
        avatar: "👤",
        color: "#2383e2",
        isOwner: true,
        agreedToEarlyUnlock: false
      }
    ],
    media: media,
    curation: null
  };

  boxes.unshift(newBox);
  saveBoxes(boxes);
  return newBox;
}

/**
 * Update an existing box
 */
export function updateBox(boxId, patch) {
  const boxes = getBoxes();
  const index = boxes.findIndex((b) => b.id === boxId);
  if (index === -1) return null;

  boxes[index] = { ...boxes[index], ...patch };
  saveBoxes(boxes);
  return boxes[index];
}

/**
 * Add uploaded media to a box
 */
export function addMediaToBox(boxId, newItems) {
  const boxes = getBoxes();
  const index = boxes.findIndex((b) => b.id === boxId);
  if (index === -1) return null;

  const currentMedia = boxes[index].media || [];
  boxes[index].media = [...currentMedia, ...newItems];
  saveBoxes(boxes);
  return boxes[index];
}

/**
 * Toggle consensus agreement for a member
 */
export function toggleMemberAgreement(boxId, memberId) {
  const boxes = getBoxes();
  const box = boxes.find((b) => b.id === boxId);
  if (!box) return null;

  box.members = box.members.map((m) => {
    if (m.id === memberId) {
      return { ...m, agreedToEarlyUnlock: !m.agreedToEarlyUnlock };
    }
    return m;
  });

  // Check if all members agreed
  const allAgreed = box.members.length > 0 && box.members.every((m) => m.agreedToEarlyUnlock);
  if (allAgreed) {
    box.status = "unlocked";
  }

  saveBoxes(boxes);
  return box;
}

/**
 * Force unlock a box (e.g. simulation or timer elapsed)
 */
export function forceUnlockBox(boxId) {
  const boxes = getBoxes();
  const box = boxes.find((b) => b.id === boxId);
  if (!box) return null;

  box.status = "unlocked";
  box.members = box.members.map(m => ({ ...m, agreedToEarlyUnlock: true }));
  saveBoxes(boxes);
  return box;
}

/**
 * Save AI curation result to box
 */
export function saveBoxCuration(boxId, curationData) {
  const boxes = getBoxes();
  const box = boxes.find((b) => b.id === boxId);
  if (!box) return null;

  box.curation = curationData;
  saveBoxes(boxes);
  return box;
}

/**
 * Delete a box
 */
export function deleteBox(boxId) {
  const boxes = getBoxes().filter((b) => b.id !== boxId);
  saveBoxes(boxes);
  return boxes;
}

/**
 * Reset all boxes to default mock data
 */
export function resetStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BOXES));
  return DEFAULT_BOXES;
}
