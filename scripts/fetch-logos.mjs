
import fs from 'fs';
import https from 'https';
import path from 'path';

const logoDir = path.join(process.cwd(), 'public', 'logos', 'banks');

if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
}

const logos = {
    'seabank.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/SeaBank_logo.svg/512px-SeaBank_logo.svg.png',
    'bca.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/512px-Bank_Central_Asia.svg.png',
    'mandiri.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/512px-Bank_Mandiri_logo_2016.svg.png',
    'bni.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/BNI_logo.svg/512px-BNI_logo.svg.png',
    'bri.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/BRI_Logo.svg/512px-BRI_Logo.svg.png',
    'cimb.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/CIMB_Niaga_logo.svg/512px-CIMB_Niaga_logo.svg.png',
    'gopay.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/512px-Gopay_logo.svg.png',
    'ovo.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/512px-Logo_ovo_purple.svg.png',
    'dana.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/512px-Logo_dana_blue.svg.png',
    'shopeepay.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/ShopeePay_logo.svg/512px-ShopeePay_logo.svg.png',
    'linkaja.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/LinkAja.svg/512px-LinkAja.svg.png',
    'jenius.png': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Jenius_logo.svg/512px-Jenius_logo.svg.png',
    'jago.png': 'https://upload.wikimedia.org/wikipedia/id/thumb/3/33/Bank_Jago_logo.svg/512px-Bank_Jago_logo.svg.png'
};

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to get '${url}' (Status Code: ${response.statusCode})`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${path.basename(dest)}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
};

async function main() {
    console.log('🚀 Memulai download logo bank & e-wallet...');
    for (const [filename, url] of Object.entries(logos)) {
        try {
            await download(url, path.join(logoDir, filename));
        } catch (err) {
            console.error(`❌ Gagal download ${filename}:`, err.message);
        }
    }
    console.log('✅ Selesai! Semua logo sudah siap di public/logos/banks/');
}

main();
