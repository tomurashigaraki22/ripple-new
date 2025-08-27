export async function logAudit(action, targetType, targetId, details = {}) {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
  
      await fetch("http://172.20.10.2:1234/admin/audit/audit-trail", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          target_type: targetType,
          target_id: targetId,
          details,
          ip_address: window.location.hostname,
        }),
      })
    } catch (err) {
      console.error("Audit log failed:", err)
    }
  }
  