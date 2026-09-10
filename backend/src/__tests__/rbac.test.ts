import { describe, it, expect } from "vitest";
import { RolePermissions } from "../utils/role-permission";
import { Permissions, Roles } from "../enums/role.enum";

describe("RBAC Matrix & Permission Enforcement Unit Tests", () => {
  it("should grant OWNER role all workspace, member, and project permissions", () => {
    const ownerPerms = RolePermissions[Roles.OWNER];

    expect(ownerPerms).toContain(Permissions.CREATE_WORKSPACE);
    expect(ownerPerms).toContain(Permissions.DELETE_WORKSPACE);
    expect(ownerPerms).toContain(Permissions.CHANGE_MEMBER_ROLE);
    expect(ownerPerms).toContain(Permissions.DELETE_PROJECT);
    expect(ownerPerms).toContain(Permissions.DELETE_TASK);
  });

  it("should forbid ADMIN role from deleting workspace or changing member roles", () => {
    const adminPerms = RolePermissions[Roles.ADMIN];

    expect(adminPerms).not.toContain(Permissions.DELETE_WORKSPACE);
    expect(adminPerms).not.toContain(Permissions.CHANGE_MEMBER_ROLE);
    expect(adminPerms).toContain(Permissions.CREATE_PROJECT);
    expect(adminPerms).toContain(Permissions.CREATE_TASK);
  });

  it("should strictly restrict MEMBER role to task creation and viewing", () => {
    const memberPerms = RolePermissions[Roles.MEMBER];

    expect(memberPerms).toContain(Permissions.VIEW_ONLY);
    expect(memberPerms).toContain(Permissions.CREATE_TASK);
    expect(memberPerms).toContain(Permissions.EDIT_TASK);

    // Strictly forbidden for regular members
    expect(memberPerms).not.toContain(Permissions.DELETE_WORKSPACE);
    expect(memberPerms).not.toContain(Permissions.DELETE_PROJECT);
    expect(memberPerms).not.toContain(Permissions.DELETE_TASK);
    expect(memberPerms).not.toContain(Permissions.CHANGE_MEMBER_ROLE);
    expect(memberPerms).not.toContain(Permissions.ADD_MEMBER);
  });
});
