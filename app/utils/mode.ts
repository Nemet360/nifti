
export const mode = arr => [...arr].sort((a,b) => arr.filter(v => v===a).length - arr.filter(v => v===b).length).pop();
