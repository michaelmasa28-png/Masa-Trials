import re, os

path = os.path.join(os.path.dirname(__file__), '..', '.env')
try:
    with open(path, encoding='utf-8') as f:
        s = f.read()
except Exception as e:
    print('no .env found:', e)
    raise SystemExit

keys = ['MPESA_ENV','MPESA_CONSUMER_KEY','MPESA_CONSUMER_SECRET','MPESA_SHORTCODE','MPESA_PASSKEY','MPESA_CALLBACK_URL']
for key in keys:
    m = re.search(r'^' + key + r'\s*=\s*(.*)$', s, re.M)
    val = m.group(1).strip().strip('"').strip("'") if m else ''
    status = 'SET' if val else 'EMPTY'
    print(f'{key} -> {status}')
    if key == 'MPESA_ENV' and val:
        print(f'   value: {val}')
    if key == 'MPESA_CALLBACK_URL' and val:
        print(f'   value: {val}')