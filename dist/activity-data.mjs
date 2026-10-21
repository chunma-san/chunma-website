export function summarize(events, now = new Date()) {
  const end = new Date(now); end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end); start.setUTCDate(start.getUTCDate() - 29);
  const days = Array.from({length: 30}, (_, i) => {
    const day = new Date(start); day.setUTCDate(day.getUTCDate() + i);
    return {date: day.toISOString().slice(0,10), total: 0, issuesOpened: 0, issuesClosed: 0, prsOpened: 0, prsClosed: 0, pushes: 0};
  });
  const seen = new Set();
  for (const event of events) {
    if (!event || seen.has(event.id) || event.public !== true) continue;
    seen.add(event.id);
    const date = new Date(event.created_at);
    if (!Number.isFinite(+date) || date > now) continue;
    const day = days.find(d => d.date === date.toISOString().slice(0,10));
    if (!day) continue;
    // Generated profile/catalog pushes should not manufacture displayed activity.
    if (event.type === 'PushEvent' && ['chunma-san/chunma-san','chunma-san/awesome-toolbox'].includes(event.repo?.name?.toLowerCase())) continue;
    day.total++;
    const action = event.payload?.action;
    if (event.type === 'PushEvent') day.pushes++;
    if (event.type === 'IssuesEvent' && action === 'opened') day.issuesOpened++;
    if (event.type === 'IssuesEvent' && action === 'closed') day.issuesClosed++;
    if (event.type === 'PullRequestEvent' && action === 'opened') day.prsOpened++;
    if (event.type === 'PullRequestEvent' && action === 'closed') day.prsClosed++;
  }
  const totals = Object.fromEntries(['total','issuesOpened','issuesClosed','prsOpened','prsClosed','pushes'].map(k => [k, days.reduce((sum,d) => sum+d[k],0)]));
  return {days, totals};
}
