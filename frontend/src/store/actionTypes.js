// =====================================================================
// actionTypes.js
// Declarative catalog of every response / remediation action in the Aegis
// Cloud Security Center. NO execution logic here — only metadata that drives
// the UI: label (the domain verb shown to the user), intent (the expected
// effect, surfaced in tooltips + the confirm modal), `hier` (visual
// hierarchy: primary / secondary / neutral / danger / success), severity
// semantics (tone), and whether the action is destructive / needs confirm.
//
// The engine (securityCenter.js) reads this catalog to simulate the result;
// transitions.js applies the resulting state change.
//
// Future: each `id` maps 1:1 to a FastAPI endpoint + AWS SDK call, e.g.
//   suspend_credential -> POST /api/actions/suspend-credential -> iam
// The frontend never calls AWS directly.
// =====================================================================

export const ACTION_TYPES = {
  // ---- Security findings ----
  remediate: {
    id: 'remediate', label: 'Apply Fix', hier: 'primary', tone: 'success',
    intent: 'Apply the recommended remediation to the affected resource and mark the finding as remediated.',
    confirm: false, destructive: false,
  },
  investigate_finding: {
    id: 'investigate_finding', label: 'Triage Finding', hier: 'secondary', tone: 'neutral',
    intent: 'Open a focused triage and move the finding into the Investigating state.',
    confirm: false, destructive: false,
  },
  accept_risk: {
    id: 'accept_risk', label: 'Accept Risk', hier: 'secondary', tone: 'warning',
    intent: 'Record a documented risk acceptance; the finding is suppressed from the active count.',
    confirm: false, destructive: false,
  },
  view_resource: {
    id: 'view_resource', label: 'View Resource', hier: 'neutral', tone: 'neutral',
    intent: 'Open the affected resource in the Infrastructure view.',
    confirm: false, destructive: false, navigate: 'infrastructure',
  },
  verify: {
    id: 'verify', label: 'Validate Fix', hier: 'success', tone: 'success',
    intent: 'Verify the remediation held and close the finding as resolved.',
    confirm: false, destructive: false,
  },

  // ---- IAM ----
  review_permissions: {
    id: 'review_permissions', label: 'Review Access', hier: 'primary', tone: 'neutral',
    intent: "Open the principal's permission review and flag it as reviewed.",
    confirm: false, destructive: false,
  },
  revoke_session: {
    id: 'revoke_session', label: 'Revoke Session', hier: 'danger', tone: 'danger',
    intent: "Terminate the principal's active sessions immediately.", confirm: true, destructive: true,
  },
  disable_access_key: {
    id: 'disable_access_key', label: 'Suspend Access Key', hier: 'danger', tone: 'danger',
    intent: "Disable the principal's active access keys immediately.", confirm: true, destructive: true,
  },
  investigate_iam: {
    id: 'investigate_iam', label: 'Investigate Access', hier: 'secondary', tone: 'neutral',
    intent: 'Open an investigation for this principal / anomaly.', confirm: false, destructive: false,
  },
  review_role: {
    id: 'review_role', label: 'Review Permissions', hier: 'primary', tone: 'neutral',
    intent: 'Open the role permissions and mark them reviewed for this high-risk role.', confirm: false, destructive: false,
  },

  // ---- Logs ----
  investigate: {
    id: 'investigate', label: 'Inspect Event', hier: 'primary', tone: 'neutral',
    intent: 'Open an investigation for this event.', confirm: false, destructive: false,
  },
  create_incident: {
    id: 'create_incident', label: 'Promote to Incident', hier: 'secondary', tone: 'neutral',
    intent: 'Promote this event into a tracked incident for response.', confirm: true, destructive: false,
  },
  block_respond: {
    id: 'block_respond', label: 'Block Source', hier: 'danger', tone: 'danger',
    intent: 'Block the identified source from further access attempts.', confirm: true, destructive: true,
  },

  // ---- Incidents ----
  start_investigation: {
    id: 'start_investigation', label: 'Begin Response', hier: 'primary', tone: 'neutral',
    intent: 'Move the incident into active investigation and begin response.', confirm: false, destructive: false,
  },
  isolate_resource: {
    id: 'isolate_resource', label: 'Contain Resource', hier: 'danger', tone: 'danger',
    intent: 'Isolate the affected resource from network access.', confirm: true, destructive: true,
  },
  revoke_access: {
    id: 'revoke_access', label: 'Revoke Access', hier: 'danger', tone: 'danger',
    intent: 'Revoke the active access/session associated with this incident.', confirm: true, destructive: true,
  },
  disable_public_access: {
    id: 'disable_public_access', label: 'Disable Public Access', hier: 'danger', tone: 'danger',
    intent: 'Remove public exposure from the affected resource.', confirm: true, destructive: true,
  },
  resolve_incident: {
    id: 'resolve_incident', label: 'Close Incident', hier: 'success', tone: 'success',
    intent: 'Mark this incident as resolved and close the active response workflow.', confirm: true, destructive: false,
  },
  reopen_incident: {
    id: 'reopen_incident', label: 'Reopen Incident', hier: 'secondary', tone: 'warning',
    intent: 'Reopen a resolved incident for further work.', confirm: false, destructive: false,
  },

  // ---- Compliance ----
  remediate_control: {
    id: 'remediate_control', label: 'Apply Control Fix', hier: 'primary', tone: 'success',
    intent: 'Apply the fix that satisfies this control and mark it passed.', confirm: false, destructive: false,
  },
  accept_exception: {
    id: 'accept_exception', label: 'Record Exception', hier: 'secondary', tone: 'warning',
    intent: 'Record a documented exception for this control.', confirm: true, destructive: false,
  },
  view_finding: {
    id: 'view_finding', label: 'View Finding', hier: 'neutral', tone: 'neutral',
    intent: 'Jump to the linked security finding.', confirm: false, destructive: false, navigate: 'security',
  },

  // ---- Reports ----
  generate_report: {
    id: 'generate_report', label: 'Generate Report', hier: 'primary', tone: 'neutral',
    intent: 'Render the selected report type and add it to history.', confirm: false, destructive: false,
  },
  download_report: {
    id: 'download_report', label: 'Download Report', hier: 'neutral', tone: 'neutral',
    intent: 'Download the generated report file.', confirm: false, destructive: false,
  },
  export_report: {
    id: 'export_report', label: 'Export Report', hier: 'neutral', tone: 'neutral',
    intent: 'Export the report to an external destination.', confirm: false, destructive: false,
  },

  // ---- Dashboard Quick Actions ----
  // Shortcuts on the Dashboard. Backend execution is NOT wired yet: the
  // confirm flow honestly reports that no changes were applied.
  isolate_instance: {
    id: 'isolate_instance', label: 'Isolate Instance', hier: 'secondary', tone: 'warning',
    intent: 'Isolate the selected instance from network access. Backend execution is not yet available for this action - no changes will be applied.',
    confirm: true, destructive: false,
  },
  create_snapshot: {
    id: 'create_snapshot', label: 'Create Snapshot', hier: 'secondary', tone: 'success',
    intent: 'Create a backup snapshot of the selected resource. Backend execution is not yet available for this action - no changes will be applied.',
    confirm: true, destructive: false,
  },
  block_ip: {
    id: 'block_ip', label: 'Block IP Address', hier: 'secondary', tone: 'warning',
    intent: 'Block the identified IP address from further access attempts. Backend execution is not yet available for this action - no changes will be applied.',
    confirm: true, destructive: false,
  },
  restart_instance: {
    id: 'restart_instance', label: 'Restart Instance', hier: 'secondary', tone: 'warning',
    intent: 'Restart the selected instance. Backend execution is not yet available for this action - no changes will be applied.',
    confirm: true, destructive: false,
  },
  send_notification: {
    id: 'send_notification', label: 'Send Notification', hier: 'secondary', tone: 'neutral',
    intent: 'Send an alert notification to the security team. Backend execution is not yet available for this action - no changes will be applied.',
    confirm: true, destructive: false,
  },
  view_logs: {
    id: 'view_logs', label: 'View Logs', hier: 'primary', tone: 'neutral',
    intent: 'Open the Logs investigation workspace.',
    confirm: false, destructive: false, navigate: 'logs',
  },}
