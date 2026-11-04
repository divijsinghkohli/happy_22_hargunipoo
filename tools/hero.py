import cv2, numpy as np, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from comicify import comicify
from rembg import remove, new_session
RAW = sys.argv[1]
im = cv2.imread(f'{RAW}/100_0233.jpg')[560:3400, 1500:3250]
r = 1900 / im.shape[0]; im = cv2.resize(im, None, fx=r, fy=r, interpolation=cv2.INTER_AREA); h, w = im.shape[:2]
c = comicify(im, cell=7)
a = np.array(remove(cv2.cvtColor(im, cv2.COLOR_BGR2RGB), session=new_session('isnet-general-use'), only_mask=True, post_process_mask=True)).astype(np.float32) / 255
a = np.clip((cv2.GaussianBlur(a, (0, 0), 1.2) - .35) / .3, 0, 1)
n, lab, st, _ = cv2.connectedComponentsWithStats((a > .5).astype(np.uint8))
big = 1 + np.argmax(st[1:, 4]); keep = (lab == big).astype(np.float32); a *= cv2.dilate(keep, np.ones((5, 5)))
g = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))), (0, 0), 1)
rgb = c.astype(np.float32) * a[..., None] + np.array([18, 10, 10], np.float32) * (1 - a[..., None])
cv2.imwrite('assets/cut/hero.webp', np.dstack([rgb, g * 255]).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 88])
print(w, h)
