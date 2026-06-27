export interface WorkspaceLike {
  id?: string;
  uuid?: string;
  workspaceId?: string;
  workspaceUUID?: string;
  name?: string;
  workspaceName?: string;
  description?: string;
  workspaceDescription?: string;
  icon?: string;
  workspaceIcon?: string;
}

export const getWorkspaceArray = (workspacesRaw: any): WorkspaceLike[] => {
  if (Array.isArray(workspacesRaw)) {
    return workspacesRaw;
  }

  if (Array.isArray(workspacesRaw?.workspaces)) {
    return workspacesRaw.workspaces;
  }

  if (Array.isArray(workspacesRaw?.data)) {
    return workspacesRaw.data;
  }

  return [];
};

export const getWorkspaceId = (workspace: WorkspaceLike | string | null | undefined): string => {
  if (!workspace) {
    return "";
  }

  if (typeof workspace === "string") {
    return workspace;
  }

  return (
    workspace.workspaceId ||
    workspace.id ||
    workspace.workspaceUUID ||
    workspace.uuid ||
    ""
  );
};

export const getWorkspaceName = (workspace: WorkspaceLike | string | null | undefined): string => {
  if (!workspace) {
    return "Workspace";
  }

  if (typeof workspace === "string") {
    return workspace;
  }

  return workspace.workspaceName || workspace.name || "Workspace";
};

export const getWorkspaceDescription = (workspace: WorkspaceLike | string | null | undefined): string => {
  if (!workspace || typeof workspace === "string") {
    return "";
  }

  return workspace.workspaceDescription || workspace.description || "";
};

export const getWorkspaceIcon = (workspace: WorkspaceLike | string | null | undefined): string => {
  if (!workspace || typeof workspace === "string") {
    return "bx bx-folder";
  }

  return workspace.workspaceIcon || workspace.icon || "bx bx-folder";
};

export const findWorkspaceById = (
  workspacesRaw: any,
  workspaceId: string | undefined
): WorkspaceLike | undefined => {
  if (!workspaceId) {
    return undefined;
  }

  return getWorkspaceArray(workspacesRaw).find(
    (workspace) => getWorkspaceId(workspace) === workspaceId
  );
};
