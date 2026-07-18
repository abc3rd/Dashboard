import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Delete the caller's own query logs using service role to bypass admin-only delete RLS
    try {
      await base44.asServiceRole.entities.QueryLog.deleteMany({ created_by_id: user.id });
    } catch (e) {
      console.error('QueryLog deletion failed:', e.message);
    }

    // Attempt to delete the user account record
    let userDeleted = false;
    try {
      await base44.asServiceRole.entities.User.delete(user.id);
      userDeleted = true;
    } catch (e) {
      console.error('User record deletion failed:', e.message);
    }

    return Response.json({
      success: true,
      userDeleted,
      message: userDeleted
        ? 'Account and data deleted successfully'
        : 'Query data deleted. Account record requires admin removal.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});