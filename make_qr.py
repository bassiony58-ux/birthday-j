import sys
import qrcode
from PIL import Image, ImageDraw, ImageFont

def generate_jana_qr(url='https://bassiony58-ux.github.io/jana-mater/', output_path='Jana_Mater_Cake_QR.png'):
    qr = qrcode.QRCode(
        version=3,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)

    qr_img = qr.make_image(fill_color='#db2777', back_color='#ffffff').convert('RGBA')

    card_w, card_h = 750, 1050
    card = Image.new('RGBA', (card_w, card_h), '#0f051d')
    draw = ImageDraw.Draw(card)

    draw.rounded_rectangle([20, 20, card_w-20, card_h-20], radius=35, outline='#f472b6', width=4)
    draw.rounded_rectangle([30, 30, card_w-30, card_h-30], radius=28, outline='#fbbf24', width=2)
    draw.rounded_rectangle([38, 38, card_w-38, card_h-38], radius=22, outline=(244, 114, 182, 90), width=1)

    try:
        font_crown = ImageFont.truetype('arial.ttf', 38)
        font_title = ImageFont.truetype('arial.ttf', 44)
        font_sub = ImageFont.truetype('arial.ttf', 24)
        font_footer = ImageFont.truetype('arial.ttf', 30)
        font_url = ImageFont.truetype('arial.ttf', 22)
    except:
        font_crown = font_title = font_sub = font_footer = font_url = ImageFont.load_default()

    draw.text((card_w//2, 80), '👑  ✨  🎂  ✨  👑', fill='#fbbf24', font=font_crown, anchor='mm')
    draw.text((card_w//2, 135), 'JANA MATER', fill='#f472b6', font=font_title, anchor='mm')
    draw.text((card_w//2, 185), 'Scan to unlock your magical birthday journey ✨', fill='#fde047', font=font_sub, anchor='mm')

    qr_w, qr_h = qr_img.size
    box_w, box_h = qr_w + 46, qr_h + 46
    box_x, box_y = (card_w - box_w) // 2, 235

    draw.rounded_rectangle([box_x, box_y, box_x + box_w, box_y + box_h], radius=24, fill='#ffffff', outline='#f472b6', width=3)
    card.paste(qr_img, (box_x + 23, box_y + 23), qr_img)

    draw.text((card_w//2, 880), 'Happy 21st Birthday, Queen Jana! 🌸', fill='#f472b6', font=font_footer, anchor='mm')
    draw.text((card_w//2, 930), 'May all your secret wishes come true 💖', fill='#e2e8f0', font=font_sub, anchor='mm')
    draw.text((card_w//2, 985), url, fill='#94a3b8', font=font_url, anchor='mm')

    card.save(output_path)
    print(f'Generated QR for: {url} -> {output_path}')

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'https://bassiony58-ux.github.io/jana-mater/'
    generate_jana_qr(target)
