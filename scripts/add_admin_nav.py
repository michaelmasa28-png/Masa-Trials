files = [
    'dashboard.html', 'members.html', 'ministries.html', 'settings.html',
    'events.html', 'communication.html', 'attendance.html',
    'galleryadmin.html', 'sermons-admin.html', 'donations.html',
]

TAG = '<script src="admin-nav.js" defer></script>'

for fname in files:
    path = 'public/' + fname
    s = open(path, encoding='utf-8').read()
    if 'admin-nav.js' in s:
        print(fname, 'ALREADY present')
        continue
    n = s.count('</body>')
    if n != 1:
        print(fname, f'SKIP ({n} </body>)')
        continue
    s = s.replace('</body>', TAG + '\n</body>', 1)
    with open(path, 'w', encoding='utf-8', newline='') as f:
        f.write(s)
    print(fname, 'ADDED')