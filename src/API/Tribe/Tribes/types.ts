// Tribes: groups of friends working out together. For now every member can do
// everything (edit, invite, remove, archive).

export interface TribeSummary {
    tribeId: string;
    name: string;
    description: string | null;
    createdAt: string;
    joinedAt: string;
    memberCount: number;
}

export interface TribeMember {
    userId: string;
    firstName: string;
    lastName: string;
    profileId: string | null;
    joinedAt: string;
    isMe: boolean;
    isCreator: boolean;
}

export interface PendingInvitation {
    invitationId: string;
    createdAt: string;
    expiresAt: string;
    firstName: string;
    lastName: string;
    profileId: string;
    invitedByFirstName: string;
    invitedByProfileId: string;
}

export interface TribeDetail {
    tribeId: string;
    name: string;
    description: string | null;
    createdAt: string;
    archived: boolean;
    memberCount: number;
    members: TribeMember[];
    pendingInvitations: PendingInvitation[];
    joinCode: string | null;            // invite link code, null when the link is off
    joinCodeExpiresAt: string | null;
}

// An invitation waiting for you
export interface MyInvitation {
    invitationId: string;
    tribeId: string;
    tribeName: string;
    tribeDescription: string | null;
    createdAt: string;
    expiresAt: string;
    invitedByFirstName: string;
    invitedByLastName: string;
    invitedByProfileId: string;
    memberCount: number;
}

// What an invite link leads to (shown before joining)
export interface CodePreview {
    tribeId: string;
    name: string;
    description: string;
    memberCount: number;
    alreadyMember: boolean;
}

export interface ProfileLookup {
    firstName: string;
    lastName: string;
    profileId: string;
}

// One shared activity in a tribe's feed
export interface FeedItem {
    activityId: string;
    userId: string;
    firstName: string;
    lastName: string;
    profileId: string | null;
    isMe: boolean;
    activityCode: string;
    description: string;
    headingCode: string;
    countsForGoals: boolean;
    startedAt: string;          // India time, "2026-11-22T18:30:00"
    startedAtInstant: string;
    activityDate: string;
    durationMinutes: number;
    distanceKm: number | null;
    kcal: number | null;
    kcalEntered: boolean;       // entered by the person (e.g. from a watch), not estimated
}

export interface FeedPage {
    items: FeedItem[];
    nextBefore: string | null;  // pass as "before" for older ones; null = no more
}
