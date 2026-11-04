import cv2, sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from comicify import comicify
SRC = sys.argv[1]; dims = {}
for slug in ['costume', 'gym', 'me', 'nice1', 'sixflags']:
    im = cv2.imread(f'{SRC}/{slug}.jpg')
    h, w = im.shape[:2]
    if slug == 'nice1': im = im[int(h * .2):int(h * .66), :int(w * .56)]   # just the mirror
    r = min(1, 1800 / max(im.shape[:2])); im = cv2.resize(im, None, fx=r, fy=r, interpolation=cv2.INTER_AREA); h, w = im.shape[:2]
    dims[slug] = [w, h]
    rr = min(1, 1300 / max(h, w))
    cv2.imwrite(f'assets/real/{slug}.webp', cv2.resize(im, None, fx=rr, fy=rr, interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 80])
    cv2.imwrite(f'assets/img/{slug}.webp', comicify(im), [cv2.IMWRITE_WEBP_QUALITY, 84])
print(json.dumps(dims))
