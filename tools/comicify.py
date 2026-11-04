"""Turns a real photo into an inked, screen-printed comic panel.
Ink lines come from an edge-only difference of Gaussians, shadows from small
spot blacks, midtones from a halftone screen. Skin is protected throughout."""
import cv2, numpy as np, sys

def lines(gray, s, k=1.7, gain=26.0, tau=.0):
    d = cv2.GaussianBlur(gray, (0, 0), s) - cv2.GaussianBlur(gray, (0, 0), s * k)
    return np.clip(-(d + tau) * gain, 0, 1)          # 1 = ink, only on the dark side of edges

def skin_mask(bgr):
    ycc = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb).astype(np.float32)
    cr, cb = ycc[..., 1], ycc[..., 2]
    m = ((cr > 133) & (cr < 178) & (cb > 78) & (cb < 132)).astype(np.float32)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((9, 9)))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((25, 25)))
    return cv2.GaussianBlur(m, (0, 0), 7)

def screen(shape, cell, angle):
    h, w = shape
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    a = np.deg2rad(angle)
    u = (x * np.cos(a) + y * np.sin(a)) / cell
    v = (-x * np.sin(a) + y * np.cos(a)) / cell
    return (np.cos(2 * np.pi * u) * np.cos(2 * np.pi * v) + 1) / 2

def comicify(bgr, line=1.0, sat=1.28, black=.13, cell=None, tiers=6, poster=.5, lift=.80):
    h, w = bgr.shape[:2]
    scale = max(h, w) / 1600
    cell = cell or max(4.5, 6.0 * scale)
    flat = bgr
    for _ in range(3):
        flat = cv2.bilateralFilter(flat, 0, 22, 6 * scale + 1)
    skin = skin_mask(flat)
    lab = cv2.cvtColor(flat.astype(np.float32) / 255, cv2.COLOR_BGR2Lab)
    L = lab[..., 0] / 100
    lo, hi = np.percentile(L, .5), np.percentile(L, 99.5)
    L = np.clip((L - lo) / max(hi - lo, 1e-3), 0, 1) ** lift
    q = L * tiers
    fr = q - np.floor(q) - .5
    tiered = (np.floor(q) + .5 + .5 * np.tanh(7 * fr) / np.tanh(3.5)) / tiers
    amount = poster * (1 - .6 * skin)
    Lout = L * (1 - amount) + tiered * amount
    lab[..., 0] = np.clip(Lout, 0, 1) * 100
    lab[..., 1] *= sat
    lab[..., 2] *= sat
    col = np.clip(cv2.cvtColor(lab, cv2.COLOR_Lab2BGR), 0, 1)
    # print grade: cool indigo into shadows, warm paper in the lights
    t = Lout[..., None]
    col = col * (np.array([.93, .985, 1.0], np.float32) * t + (1 - t)) + np.array([.20, .08, .05], np.float32) * (1 - t) ** 2 * .5
    # halftone over shadows, barely on skin
    dark = np.clip((.52 - Lout) / .42, 0, 1) * (1 - .85 * skin)
    dots = np.clip((dark * .95 - screen((h, w), cell, 45)) * 5 + .5, 0, 1) * (dark > .03)
    col = col * (1 - dots[..., None] * .55) + np.array([.28, .10, .08], np.float32) * dots[..., None] * .55
    # spot blacks: only the true darks, as clean shapes
    Lb = cv2.GaussianBlur(Lout, (0, 0), 2.0 * scale)
    spot = np.clip((black * (1 - .7 * skin) - Lb) / .03 + .5, 0, 1)
    # ink
    gray = cv2.cvtColor(flat, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    fine = lines(gray, 1.05 * scale * line, gain=31)
    bold = lines(gray, 2.4 * scale * line, gain=23, tau=-.004)
    ink = np.maximum(fine * (1 - .35 * skin), bold * (1 - .45 * skin))
    ink = np.clip((ink - .16) / .5, 0, 1)
    ink = np.maximum(ink, spot)
    ink = cv2.GaussianBlur(ink, (0, 0), .5 * scale)
    out = col * (1 - ink[..., None]) + np.array([.11, .05, .05], np.float32) * ink[..., None]
    # slight misregistration of the red plate
    M = np.float32([[1, 0, 1.3 * scale], [0, 1, -.9 * scale]])
    out[..., 2] = cv2.warpAffine(out[..., 2], M, (w, h), borderMode=cv2.BORDER_REPLICATE)
    return (np.clip(out, 0, 1) * 255).astype(np.uint8)

if __name__ == '__main__':
    src, dst = sys.argv[1:3]
    im = cv2.imread(src); r = 1600 / max(im.shape[:2])
    im = cv2.resize(im, None, fx=r, fy=r, interpolation=cv2.INTER_AREA)
    cv2.imwrite(dst, comicify(im), [cv2.IMWRITE_JPEG_QUALITY, 90])
