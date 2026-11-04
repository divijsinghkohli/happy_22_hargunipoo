import cv2, numpy as np, sys, json, os, glob
sys.path.insert(0, os.path.dirname(__file__))
from comicify import comicify
from rembg import remove, new_session
RAW, OUT = sys.argv[1], sys.argv[2]
NAMES = {  # source -> slug
 '100_0210':'waterfall','100_0223':'diner','100_0233':'hero','DSCN2603':'masks','IMG_0177':'flowers','IMG_0515':'hood',
 'IMG_0693':'mirror','IMG_0696':'facetime','IMG_0899':'headphones','IMG_0974':'fence','IMG_1046':'burger','IMG_1138':'suit',
 'IMG_3111':'picnic','IMG_3170':'flex','IMG_3196':'buckethat','IMG_3287':'lift','IMG_3316_2':'braids','IMG_3387':'bluechair',
 'IMG_3402':'us','IMG_3462':'capper'}
CUT = {'hero','flex','us','capper','buckethat','masks','braids'}
sess = new_session('isnet-general-use')
dims = {}
for src, slug in NAMES.items():
    im = cv2.imread(f'{RAW}/{src}.jpg')
    if slug == 'waterfall': im = cv2.rotate(im, cv2.ROTATE_90_COUNTERCLOCKWISE)
    h, w = im.shape[:2]
    if slug == 'mirror': im = im[int(h*.095):int(h*.77)]
    if slug == 'facetime': im = im[int(h*.065):]
    h, w = im.shape[:2]
    r = min(1, 1800 / max(h, w))
    im = cv2.resize(im, None, fx=r, fy=r, interpolation=cv2.INTER_AREA)
    h, w = im.shape[:2]
    dims[slug] = [w, h]
    rr = min(1, 1300 / max(h, w))
    cv2.imwrite(f'{OUT}/real/{slug}.webp', cv2.resize(im, None, fx=rr, fy=rr, interpolation=cv2.INTER_AREA), [cv2.IMWRITE_WEBP_QUALITY, 80])
    c = comicify(im)
    cv2.imwrite(f'{OUT}/img/{slug}.webp', c, [cv2.IMWRITE_WEBP_QUALITY, 84])
    if slug in CUT:
        a = remove(cv2.cvtColor(im, cv2.COLOR_BGR2RGB), session=sess, only_mask=True, post_process_mask=True)
        a = np.array(a).astype(np.float32) / 255
        a = np.clip((cv2.GaussianBlur(a, (0, 0), 1.2) - .35) / .3, 0, 1)
        # keep only sizeable blobs, drop specks
        n, lab, st, _ = cv2.connectedComponentsWithStats((a > .5).astype(np.uint8))
        keep = np.zeros_like(a)
        for i in range(1, n):
            if st[i, 4] > .02 * h * w: keep[lab == i] = 1
        a *= cv2.dilate(keep, np.ones((5, 5)))
        # thick ink contour around the silhouette, like a hand-inked figure
        t = int(max(h, w) / 300) + 2
        grown = cv2.dilate(a, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (t*2+1, t*2+1)))
        grown = cv2.GaussianBlur(grown, (0, 0), 1)
        rgb = c.astype(np.float32) * a[..., None] + np.array([18, 10, 10], np.float32) * (1 - a[..., None])
        out = np.dstack([rgb, grown * 255]).astype(np.uint8)
        cv2.imwrite(f'{OUT}/cut/{slug}.webp', out, [cv2.IMWRITE_WEBP_QUALITY, 86])
    print(slug, w, h, flush=True)
json.dump(dims, open(f'{OUT}/dims.json', 'w'))
