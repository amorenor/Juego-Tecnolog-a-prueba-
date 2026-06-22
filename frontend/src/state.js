// ── Shared application state ──────────────────────────────────────────────────
// All screens read from and write to this single object.
// Mutations go to the API first; on success, update state and re-render.

export const db = {
  teams:      [],
  employees:  [],
  attendance: [],
  users:      [],
};

export const sel = {
  currentTeamId:   null,
  currentEmpId:    null,
  currentCommitType:  null,
  editingCommitId: null,
  eqFilter:        '',
  eqPillActive:    'all',
  plannerWeek:     null,
  plannerTeam:     'all',
  pendingComp:     null,
  calYear:         new Date().getFullYear(),
  calMonth:        new Date().getMonth(),
  calViewMode:     'full',
};
