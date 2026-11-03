"""Gộp www/ thành 1 file HTML duy nhất để chạy thử trên PC (Chrome) hoặc trong Claude."""
import re, pathlib
W = pathlib.Path(__file__).parent / 'www'
css = (W / 'css/style.css').read_text(encoding='utf-8')
css = re.sub(r"@font-face \{[^}]*\}\s*", '', css)  # bản demo lấy font từ Google Fonts
body = re.search(r'<body>(.*?)<script', (W / 'index.html').read_text(encoding='utf-8'), re.S).group(1)
js = '\n'.join((W / 'js' / f).read_text(encoding='utf-8') for f in ['data.js', 'book.js', 'characters.js', 'speech.js', 'app.js'])
out = f'''<title>Bé Học Tiếng Anh</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&display=swap">
<style>
{css}
</style>
{body}
<script>
{js}
</script>
'''
d = pathlib.Path(__file__).parent / 'demo'; d.mkdir(exist_ok=True)
(d / 'BeHocTiengAnh_demo.html').write_text(out, encoding='utf-8')
print('OK', len(out))
