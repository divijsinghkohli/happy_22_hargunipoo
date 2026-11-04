import cv2, numpy as np, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from comicify import comicify
from rembg import remove, new_session
NEW = sys.argv[1]
sess = new_session('isnet-general-use')
for src, slug, cut in [('lp_image', 'candle', True), ('IMG_2707', 'museum', False)]:
    im = cv2.imread(f'{NEW}/{src}.jpg')
    r = min(1, 1800 / max(im.shape[:2])); im = cv2.resize(im, None, fx=r, fy=r, interpolation=cv2.INTER_AREA); h, w = im.shape[:2]
    rr = min(1, 1300 / max(h, w))
    cv2.imwrite(f'assets/real/{slug}.webp', cv2.resize(im, None, fx=rr, fy=rr, interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 80])
    c = comicify(im); cv2.imwrite(f'assets/img/{slug}.webp', c, [cv2.IMWRITE_WEBP_QUALITY, 84])
    print(slug, w, h)
    if cut:
        a = np.array(remove(cv2.cvtColor(im, cv2.COLOR_BGR2RGB), session=sess, only_mask=True, post_process_mask=True)).astype(np.float32) / 255
        a = np.clip((cv2.GaussianBlur(a, (0, 0), 1.2) - .35) / .3, 0, 1)
        n, lab, st, _ = cv2.connectedComponentsWithStats((a > .5).astype(np.uint8))
        big = 1 + np.argmax(st[1:, 4]); a *= cv2.dilate((lab == big).astype(np.float32), np.ones((5, 5)))
        g = cv2.GaussianBlur(cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))), (0, 0), 1)
        rgb = c.astype(np.float32) * a[..., None] + np.array([18, 10, 10], np.float32) * (1 - a[..., None])
        cv2.imwrite(f'assets/cut/{slug}.webp', np.dstack([rgb, g * 255]).astype(np.uint8), [cv2.IMWRITE_WEBP_QUALITY, 88])
        ys, xs = np.where(a > .5); print('cut bbox', xs.min(), xs.max(), ys.min(), ys.max())
