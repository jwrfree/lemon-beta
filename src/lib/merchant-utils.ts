import {
    Tv, Music, Coffee, ShoppingBag, Car,
    CreditCard, Utensils,
    Gamepad2, Plane, Smartphone, Zap, Droplets, Wifi, Train,
    Package, Apple, Play, Cloud, ShoppingCart, Truck, Stethoscope, Pizza,
    TrendingUp, Coins, Dumbbell, GraduationCap, Heart, Home, Lamp, Ticket,
    ShieldCheck, Monitor, Cpu, Mouse, Speaker, HardDrive, Fuel, Wrench,
    Shirt, Watch, Flower
} from 'lucide-react';

export interface MerchantVisuals {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    brandColor?: string;
    domain?: string;
    logo?: string; // Local first logo path
}

export const MERCHANT_MAP: Record<string, MerchantVisuals> = {
    // --- ENTERTAINMENT ---
    'netflix': { icon: Tv, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'netflix.com' },
    'spotify': { icon: Music, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'spotify.com' },
    'youtube': { icon: Tv, color: 'text-rose-700', bgColor: 'bg-rose-100', domain: 'youtube.com' },
    'disney': { icon: Tv, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'disneyplus.com' },
    'hbo': { icon: Tv, color: 'text-indigo-600', bgColor: 'bg-indigo-50', domain: 'hbo.com' },
    'steam': { icon: Gamepad2, color: 'text-slate-700', bgColor: 'bg-slate-100', domain: 'steampowered.com' },
    'playstation': { icon: Gamepad2, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'playstation.com' },
    'moonton': { icon: Gamepad2, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'moonton.com' },
    'mobile legends': { icon: Gamepad2, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'moonton.com' },
    'mlbb': { icon: Gamepad2, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'moonton.com' },
    'garena': { icon: Gamepad2, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'garena.com' },
    'free fire': { icon: Gamepad2, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'ff.garena.com' },
    'mihoyo': { icon: Gamepad2, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'mihoyo.com' },
    'hoyoverse': { icon: Gamepad2, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'hoyoverse.com' },
    'genshin': { icon: Gamepad2, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'hoyoverse.com' },
    'roblox': { icon: Gamepad2, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'roblox.com' },
    'riot games': { icon: Gamepad2, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'riotgames.com' },
    'valorant': { icon: Gamepad2, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'playvalorant.com' },

    'apple': { icon: Apple, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'apple.com' },
    'icloud': { icon: Cloud, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'apple.com' },
    'google': { icon: Play, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'google.com' },
    'play store': { icon: Play, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'play.google.com' },
    'canva': { icon: Cloud, color: 'text-cyan-600', bgColor: 'bg-cyan-50', domain: 'canva.com' },
    'chatgpt': { icon: Play, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'openai.com' },
    'openai': { icon: Play, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'openai.com' },
    'zoom': { icon: Tv, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'zoom.us' },
    'microsoft': { icon: Cloud, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'microsoft.com' },
    'adobe': { icon: Cloud, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'adobe.com' },
    'midjourney': { icon: Cloud, color: 'text-slate-800', bgColor: 'bg-slate-100', domain: 'midjourney.com' },
    'vidio': { icon: Tv, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'vidio.com' },
    'viu': { icon: Tv, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'viu.com' },
    'wetv': { icon: Tv, color: 'text-orange-500', bgColor: 'bg-orange-50', domain: 'wetv.vip' },
    'iqiyi': { icon: Tv, color: 'text-emerald-500', bgColor: 'bg-emerald-50', domain: 'iq.com' },
    'amazon': { icon: ShoppingBag, color: 'text-orange-500', bgColor: 'bg-orange-50', domain: 'amazon.com' },
    'prime video': { icon: Tv, color: 'text-cyan-500', bgColor: 'bg-cyan-50', domain: 'primevideo.com' },
    // --- DEV & INFRA ---
    'aws': { icon: Cloud, color: 'text-orange-500', bgColor: 'bg-orange-50', domain: 'aws.amazon.com' },
    'vercel': { icon: Cloud, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'vercel.com' },
    'github': { icon: Smartphone, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'github.com' },
    'netlify': { icon: Cloud, color: 'text-cyan-500', bgColor: 'bg-cyan-50', domain: 'netlify.com' },
    'cloudflare': { icon: Cloud, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'cloudflare.com' },
    'digitalocean': { icon: Cloud, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'digitalocean.com' },
    'heroku': { icon: Cloud, color: 'text-purple-600', bgColor: 'bg-purple-50', domain: 'heroku.com' },
    'namecheap': { icon: Cloud, color: 'text-orange-700', bgColor: 'bg-orange-50', domain: 'namecheap.com' },
    'godaddy': { icon: Cloud, color: 'text-teal-600', bgColor: 'bg-teal-50', domain: 'godaddy.com' },
    'alibaba cloud': { icon: Cloud, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'alibabacloud.com' },
    'hostinger': { icon: Cloud, color: 'text-purple-700', bgColor: 'bg-purple-50', domain: 'hostinger.co.id' },

    // --- OFFICE & PRODUCTIVITY ---
    'slack': { icon: Smartphone, color: 'text-purple-600', bgColor: 'bg-purple-50', domain: 'slack.com' },
    'trello': { icon: ShoppingBag, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'trello.com' },
    'dropbox': { icon: Cloud, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'dropbox.com' },
    'notion': { icon: Cloud, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'notion.so' },
    'discord': { icon: Gamepad2, color: 'text-indigo-600', bgColor: 'bg-indigo-50', domain: 'discord.com' },
    'patreon': { icon: Heart, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'patreon.com' },



    // --- FOOD & BEVERAGE ---
    'starbucks': { icon: Coffee, color: 'text-emerald-800', bgColor: 'bg-emerald-50', domain: 'starbucks.com' },
    'kopi kenangan': { icon: Coffee, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'kopikenangan.com' },
    'janji jiwa': { icon: Coffee, color: 'text-orange-800', bgColor: 'bg-orange-50', domain: 'jiwagroup.com' },
    'fore coffee': { icon: Coffee, color: 'text-emerald-900', bgColor: 'bg-emerald-50', domain: 'fore.coffee' },
    'mixue': { icon: Coffee, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'mixue.com' },
    'chatime': { icon: Coffee, color: 'text-purple-600', bgColor: 'bg-purple-50', domain: 'chatime.com.tw' },
    'j.co': { icon: Coffee, color: 'text-orange-700', bgColor: 'bg-orange-50', domain: 'jcodonuts.com' },
    'point coffee': { icon: Coffee, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'pointcoffee.id' },
    'kopi tuku': { icon: Coffee, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'tuku.coffee' },
    'kopi lain hati': { icon: Coffee, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    'dunkin': { icon: Coffee, color: 'text-pink-600', bgColor: 'bg-pink-50', domain: 'dunkindonuts.com' },

    'mcdonalds': { icon: Utensils, color: 'text-amber-500', bgColor: 'bg-amber-50', domain: 'mcdonalds.com' },
    'kfc': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-rose-100', domain: 'kfc.com' },
    'hokben': { icon: Utensils, color: 'text-yellow-500', bgColor: 'bg-yellow-50', domain: 'hokben.co.id' },
    'pizza hut': { icon: Pizza, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'pizzahut.co.id' },
    'solaria': { icon: Utensils, color: 'text-purple-700', bgColor: 'bg-purple-50', domain: 'solariaresto.com' },
    'burger king': { icon: Utensils, color: 'text-orange-800', bgColor: 'bg-orange-50', domain: 'burgerking.co.id' },
    'bakmi gm': { icon: Utensils, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'bakmigm.com' },
    'gacoan': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'mie-gacoan.com' },
    'mie gacoan': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'mie-gacoan.com' },
    'bebek kaleyo': { icon: Utensils, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'kaleyo.com' },
    'ayam geprek': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-orange-50' },
    'es teler 77': { icon: Utensils, color: 'text-emerald-600', bgColor: 'bg-yellow-50', domain: 'esteler77.com' },
    'richeese': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-orange-50', domain: 'richeesefactory.com' },
    'waroeng steak': { icon: Utensils, color: 'text-amber-600', bgColor: 'bg-zinc-900', domain: 'waroengsteakandshake.com' },
    'kopi nako': { icon: Coffee, color: 'text-zinc-800', bgColor: 'bg-zinc-50', domain: 'kopinako.com' },
    'kopi soe': { icon: Coffee, color: 'text-blue-700', bgColor: 'bg-blue-50' },
    'dear butter': { icon: Utensils, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    'gildak': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    'street boba': { icon: Coffee, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'haus!': { icon: Coffee, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    'teguk': { icon: Coffee, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    'mako': { icon: Utensils, color: 'text-amber-700', bgColor: 'bg-amber-50' },
    'holland bakery': { icon: Coffee, color: 'text-rose-600', bgColor: 'bg-orange-50', domain: 'hollandbakery.co.id' },
    'kartika sari': { icon: Coffee, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'kartikasari.com' },
    'amanda brownies': { icon: Coffee, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'amandabrownies.co.id' },



    // --- SHOPPING ---
    'tokopedia': { icon: ShoppingBag, color: 'text-emerald-500', bgColor: 'bg-emerald-50', domain: 'tokopedia.com' },
    'shopee': { icon: ShoppingBag, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'shopee.co.id' },
    'lazada': { icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'lazada.co.id' },
    'alfamart': { icon: ShoppingBag, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'alfamart.co.id' },
    'indomaret': { icon: ShoppingBag, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'indomaret.co.id' },
    'uniqlo': { icon: ShoppingBag, color: 'text-rose-700', bgColor: 'bg-rose-100', domain: 'uniqlo.com' },
    'h&m': { icon: ShoppingBag, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'hm.com' },
    'sociolla': { icon: ShoppingBag, color: 'text-pink-500', bgColor: 'bg-pink-50', domain: 'sociolla.com' },
    'sephora': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'sephora.co.id' },
    'matahari': { icon: ShoppingBag, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'matahari.com' },
    'ramayana': { icon: ShoppingBag, color: 'text-rose-600', bgColor: 'bg-orange-50', domain: 'ramayana.co.id' },

    // --- BEAUTY & SKINCARE ---
    'wardah': { icon: Flower, color: 'text-teal-600', bgColor: 'bg-teal-50', domain: 'wardahbeauty.com' },
    'kahf': { icon: Flower, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'kahfeveryday.com' },
    'emina': { icon: Flower, color: 'text-pink-500', bgColor: 'bg-pink-50', domain: 'eminacosmetics.com' },
    'make over': { icon: Flower, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'makeoverforall.com' },
    'somethinc': { icon: Flower, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'somethinc.com' },
    'avoskin': { icon: Flower, color: 'text-emerald-800', bgColor: 'bg-emerald-50', domain: 'avoskinbeauty.com' },
    'azarine': { icon: Flower, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'azarinecosmetic.com' },
    'scarlett': { icon: Flower, color: 'text-pink-400', bgColor: 'bg-pink-50', domain: 'scarlettwhitening.com' },
    'skintific': { icon: Flower, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'skintific.id' },
    'the originote': { icon: Flower, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'theoriginote.com' },
    'glad2glow': { icon: Flower, color: 'text-rose-400', bgColor: 'bg-rose-50', domain: 'glad2glow.com' },
    'ms glow': { icon: Flower, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'msglowid.com' },
    'purbasari': { icon: Flower, color: 'text-amber-700', bgColor: 'bg-amber-50' },
    'implora': { icon: Flower, color: 'text-rose-500', bgColor: 'bg-rose-50' },
    'biore': { icon: Flower, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'kao.com' },
    'garnier': { icon: Flower, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'garnier.co.id' },
    'nivea': { icon: Flower, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'nivea.co.id' },
    'ponds': { icon: Flower, color: 'text-rose-500', bgColor: 'bg-rose-50', domain: 'ponds.com' },
    'vaseline': { icon: Flower, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'vaseline.com' },
    'cetaphil': { icon: Flower, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'cetaphil.co.id' },

    // Keywords for auto-branding
    'skincare': { icon: Flower, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    'facewash': { icon: Flower, color: 'text-blue-400', bgColor: 'bg-blue-50' },
    'face wash': { icon: Flower, color: 'text-blue-400', bgColor: 'bg-blue-50' },
    'serum': { icon: Flower, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    'sunscreen': { icon: Flower, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    'moisturizer': { icon: Flower, color: 'text-emerald-400', bgColor: 'bg-emerald-50' },
    'pelembab': { icon: Flower, color: 'text-emerald-400', bgColor: 'bg-emerald-50' },
    'sabun muka': { icon: Flower, color: 'text-blue-400', bgColor: 'bg-blue-50' },


    'blibli': { icon: ShoppingBag, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'blibli.com' },
    'zalora': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'zalora.co.id' },
    'superindo': { icon: ShoppingCart, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'superindo.co.id' },
    'hypermart': { icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'hypermart.co.id' },
    'sayurbox': { icon: ShoppingCart, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'sayurbox.com' },
    'astro': { icon: ShoppingCart, color: 'text-indigo-600', bgColor: 'bg-indigo-50', domain: 'astro.id' },
    'transmart': { icon: ShoppingCart, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'transmart.co.id' },
    'lotte mart': { icon: ShoppingCart, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'lottemart.co.id' },
    'ranch market': { icon: ShoppingCart, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'ranchmarket.co.id' },
    'farmers market': { icon: ShoppingCart, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'farmersmarket.co.id' },
    'hero': { icon: ShoppingCart, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'hero.co.id' },
    'guardian': { icon: ShoppingBag, color: 'text-orange-500', bgColor: 'bg-orange-50', domain: 'guardianindonesia.co.id' },
    'watsons': { icon: ShoppingBag, color: 'text-teal-600', bgColor: 'bg-teal-50', domain: 'watsons.co.id' },
    'erigo': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'erigostore.id' },

    // --- FASHION & APPAREL ---
    '3second': { icon: Shirt, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: '3second.co.id' },
    'greenlight': { icon: Shirt, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: '3second.co.id' },
    'roughneck 1991': { icon: Shirt, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'roughneck1991.com' },
    'the executive': { icon: Shirt, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'executive.co.id' },
    'executive': { icon: Shirt, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'executive.co.id' },
    'cardinal': { icon: Shirt, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'cardinal.co.id' },
    'hammer': { icon: Shirt, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'hammer-fashion.com' },
    'damn! i love indonesia': { icon: Shirt, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'damniloveindonesia.com' },
    'cotton ink': { icon: Shirt, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'cottonink.co.id' },
    'minimal': { icon: Shirt, color: 'text-zinc-900', bgColor: 'bg-zinc-50', domain: 'minimal.co.id' },

    'zara': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-white', domain: 'zara.com' },
    'pull&bear': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'pullandbear.com' },
    'bershka': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-white', domain: 'bershka.com' },
    'stradivarius': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-amber-50', domain: 'stradivarius.com' },
    'mango': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-white', domain: 'mango.com' },
    'charles & keith': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'charleskeith.co.id' },
    'pedro': { icon: ShoppingBag, color: 'text-zinc-800', bgColor: 'bg-zinc-50', domain: 'pedroshoes.com' },

    // --- SHOES & FOOTWEAR (LOCAL) ---
    'ventela': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'ventela.com' },
    'compass': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-50', domain: 'sepatucompass.id' },
    'aerostreet': { icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'aerostreet.id' },
    'brodo': { icon: ShoppingBag, color: 'text-zinc-800', bgColor: 'bg-zinc-100', domain: 'bro.do' },
    'patrobas': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'patrobas.id' },
    'geoff max': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-white', domain: 'geoff-max.com' },

    // --- LIFESTYLE APPAREL & BAGS ---
    'exsport': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-50', domain: 'exsport.co.id' },
    'bodypack': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'bodypack.co.id' },
    'torch': { icon: ShoppingBag, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'torch.id' },
    'thanksinsomnia': { icon: Shirt, color: 'text-zinc-900', bgColor: 'bg-white', domain: 'thanksinsomnia.id' },
    'public culture': { icon: Shirt, color: 'text-zinc-900', bgColor: 'bg-yellow-50', domain: 'public-culture.com' },
    'screamous': { icon: Shirt, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'shining bright': { icon: Shirt, color: 'text-rose-600', bgColor: 'bg-rose-50' },


    // --- SPORTS & OUTDOOR ---
    'nike': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'nike.com' },
    'adidas': { icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'adidas.co.id' },
    'puma': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'puma.com' },
    'skechers': { icon: ShoppingBag, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'skechers.id' },
    'converse': { icon: ShoppingBag, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'converse.id' },
    'vans': { icon: ShoppingBag, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'vans.co.id' },
    'decathlon': { icon: ShoppingBag, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'decathlon.co.id' },
    'sports station': { icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-yellow-50', domain: 'mapactive.id' },
    'foot locker': { icon: ShoppingBag, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'footlocker.id' },
    'eiger': { icon: Shirt, color: 'text-rose-600', bgColor: 'bg-zinc-900', domain: 'eigeradventure.com' },



    'ace hardware': { icon: Lamp, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'acehardware.co.id' },
    'ikea': { icon: Home, color: 'text-blue-700', bgColor: 'bg-yellow-100', domain: 'ikea.co.id' },
    'informa': { icon: Lamp, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'informa.co.id' },
    'mr. diy': { icon: Lamp, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'mrdiy.com' },
    'mrdiy': { icon: Lamp, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'mrdiy.com' },

    // --- TRANSPORT ---
    'gojek': { icon: Car, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'gojek.com' },
    'grab': { icon: Car, color: 'text-emerald-500', bgColor: 'bg-emerald-50', domain: 'grab.com' },
    'traveloka': { icon: Plane, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'traveloka.com' },
    'tiket.com': { icon: Plane, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'tiket.com' },
    'agoda': { icon: Plane, color: 'text-rose-500', bgColor: 'bg-rose-50', domain: 'agoda.com' },
    'booking.com': { icon: Plane, color: 'text-blue-700', bgColor: 'bg-blue-100', domain: 'booking.com' },
    'airbnb': { icon: Plane, color: 'text-rose-500', bgColor: 'bg-rose-50', domain: 'airbnb.com' },
    'garuda': { icon: Plane, color: 'text-blue-900', bgColor: 'bg-blue-50', domain: 'garuda-indonesia.com' },
    'airasia': { icon: Plane, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'airasia.com' },
    'citilink': { icon: Plane, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'citilink.co.id' },
    'lion air': { icon: Plane, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'lionair.co.id' },

    'bluebird': { icon: Car, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'bluebirdgroup.com' },
    'indriver': { icon: Car, color: 'text-emerald-500', bgColor: 'bg-emerald-100', domain: 'indriver.com' },
    'maxim': { icon: Car, color: 'text-yellow-500', bgColor: 'bg-yellow-50', domain: 'taximaxim.com' },
    'mrt': { icon: Train, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'jakartamrt.co.id' },
    'lrt': { icon: Train, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'lrtjakarta.co.id' },
    'krl': { icon: Train, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'kcia.co.id' },
    'transjakarta': { icon: Train, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'transjakarta.co.id' },
    'm-tix': { icon: Ticket, color: 'text-amber-600', bgColor: 'bg-amber-50', domain: '21cineplex.com' },
    'mtix': { icon: Ticket, color: 'text-amber-600', bgColor: 'bg-amber-50', domain: '21cineplex.com' },
    'loket.com': { icon: Ticket, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'loket.com' },

    // --- FUEL & AUTOMOTIVE ---
    'pertamina': { icon: Fuel, color: 'text-blue-600', bgColor: 'bg-rose-50', domain: 'pertamina.com' },
    'pertamax': { icon: Fuel, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'pertalite': { icon: Fuel, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    'shell': { icon: Fuel, color: 'text-yellow-500', bgColor: 'bg-rose-50', domain: 'shell.co.id' },
    'bp': { icon: Fuel, color: 'text-emerald-700', bgColor: 'bg-yellow-50', domain: 'bp.com' },
    'bensin': { icon: Fuel, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'servis motor': { icon: Wrench, color: 'text-zinc-700', bgColor: 'bg-zinc-100' },
    'servis mobil': { icon: Wrench, color: 'text-zinc-700', bgColor: 'bg-zinc-100' },
    'bengkel': { icon: Wrench, color: 'text-zinc-700', bgColor: 'bg-zinc-100' },


    // --- ELECTRONICS & GADGETS ---
    'samsung': { icon: Smartphone, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'samsung.com' },
    'sony': { icon: Monitor, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'sony.com' },
    'lg': { icon: Monitor, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'lg.com' },
    'panasonic': { icon: Zap, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'panasonic.com' },
    'xiaomi': { icon: Smartphone, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'mi.com' },
    'oppo': { icon: Smartphone, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'oppo.com' },
    'vivo': { icon: Smartphone, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'vivo.com' },
    'realme': { icon: Smartphone, color: 'text-yellow-500', bgColor: 'bg-yellow-50', domain: 'realme.com' },
    'hp': { icon: Monitor, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'hp.com' },
    'lenovo': { icon: Monitor, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'lenovo.com' },
    'dell': { icon: Monitor, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'dell.com' },
    'acer': { icon: Monitor, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'acer.com' },
    'msi': { icon: Monitor, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'msi.com' },
    'asus': { icon: Monitor, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'asus.com' },
    'rog': { icon: Gamepad2, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'rog.asus.com' },
    'erafone': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'eraspace.com' },
    'ibox': { icon: Smartphone, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'eraspace.com' },
    'digimap': { icon: Smartphone, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'digimap.co.id' },
    'planet gadget': { icon: Smartphone, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'planetgadget.store' },
    'polytron': { icon: Monitor, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'polytron.co.id' },
    'advan': { icon: Smartphone, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'advandigital.com' },
    'axioo': { icon: Monitor, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'axiooworld.com' },
    'mito': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50' },



    // --- COMPUTER COMPONENTS & PERIPHERALS ---
    'intel': { icon: Cpu, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'intel.com' },
    'amd': { icon: Cpu, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'amd.com' },
    'nvidia': { icon: Cpu, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'nvidia.com' },
    'rtx': { icon: Cpu, color: 'text-emerald-500', bgColor: 'bg-emerald-50', domain: 'nvidia.com' },
    'logitech': { icon: Mouse, color: 'text-sky-500', bgColor: 'bg-sky-50', domain: 'logitech.com' },
    'razer': { icon: Mouse, color: 'text-emerald-500', bgColor: 'bg-zinc-900', domain: 'razer.com' },
    'corsair': { icon: Cpu, color: 'text-yellow-500', bgColor: 'bg-zinc-900', domain: 'corsair.com' },
    'kingston': { icon: HardDrive, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'kingston.com' },
    'seagate': { icon: HardDrive, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'seagate.com' },
    'wd': { icon: HardDrive, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'westerndigital.com' },
    'western digital': { icon: HardDrive, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'westerndigital.com' },
    'sandisk': { icon: HardDrive, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'sandisk.com' },
    'tp-link': { icon: Wifi, color: 'text-cyan-500', bgColor: 'bg-cyan-50', domain: 'tp-link.com' },
    'tapo': { icon: Home, color: 'text-cyan-500', bgColor: 'bg-cyan-50', domain: 'tapo.com' },
    'bardi': { icon: Home, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'bardi.co.id' },
    'tuya': { icon: Home, color: 'text-orange-500', bgColor: 'bg-orange-50', domain: 'tuya.com' },
    'philips hue': { icon: Lamp, color: 'text-purple-600', bgColor: 'bg-purple-50', domain: 'philips-hue.com' },
    'google nest': { icon: Home, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'nest.google.com' },
    'google home': { icon: Home, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'home.google.com' },
    'mi home': { icon: Home, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'mi.com' },
    'ecovacs': { icon: Zap, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'ecovacs.com' },
    'dreame': { icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'dreametech.com' },
    'roborock': { icon: Zap, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'roborock.com' },

    // --- FMCG & FOOD BRANDS ---
    'indomie': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-yellow-50', domain: 'indomie.com' },
    'sarimi': { icon: Utensils, color: 'text-amber-500', bgColor: 'bg-amber-50' },
    'sedaap': { icon: Utensils, color: 'text-rose-700', bgColor: 'bg-rose-50' },
    'mie sedaap': { icon: Utensils, color: 'text-rose-700', bgColor: 'bg-rose-50' },
    'aqua': { icon: Droplets, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'sehataqua.co.id' },
    'nestle': { icon: Utensils, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'nestle.co.id' },
    'campina': { icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'campina.co.id' },
    'wall\'s': { icon: ShoppingCart, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'wallsicecream.com' },
    'indomilk': { icon: Utensils, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'indomilk.com' },
    'abc': { icon: Utensils, color: 'text-rose-600', bgColor: 'bg-orange-50', domain: 'heinzabc.co.id' },
    'kapal api': { icon: Coffee, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'kapalapi.co.id' },



    // --- FINANCE ---
    'bca': { icon: CreditCard, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'bca.co.id' },
    'mandiri': { icon: CreditCard, color: 'text-blue-900', bgColor: 'bg-yellow-50', domain: 'bankmandiri.co.id' },
    'bni': { icon: CreditCard, color: 'text-orange-700', bgColor: 'bg-orange-50', domain: 'bni.co.id' },
    'bri': { icon: CreditCard, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'bri.co.id' },
    'cimb': { icon: CreditCard, color: 'text-rose-700', bgColor: 'bg-rose-50', domain: 'cimbniaga.co.id' },
    'bsi': { icon: CreditCard, color: 'text-teal-700', bgColor: 'bg-teal-50', domain: 'bankbsi.co.id' },
    'dana': { icon: Smartphone, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'dana.id' },
    'ovo': { icon: Smartphone, color: 'text-purple-700', bgColor: 'bg-purple-50', domain: 'tokopedia.com' },
    'ovo cash': { icon: Smartphone, color: 'text-purple-700', bgColor: 'bg-purple-50', domain: 'tokopedia.com' },
    'gopay': { icon: Smartphone, color: 'text-blue-400', bgColor: 'bg-blue-50', domain: 'gopay.co.id' },
    'linkaja': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'linkaja.id' },
    'shopeepay': { icon: Smartphone, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'shopee.co.id' },
    'jenius': { icon: CreditCard, color: 'text-blue-400', bgColor: 'bg-blue-50', domain: 'jenius.com' },
    'jago': { icon: CreditCard, color: 'text-amber-500', bgColor: 'bg-amber-50', domain: 'jago.com' },
    'blu': { icon: CreditCard, color: 'text-blue-400', bgColor: 'bg-blue-50', domain: 'blubybcadigital.id' },
    'superbank': { icon: CreditCard, color: 'text-purple-600', bgColor: 'bg-purple-50', domain: 'superbank.id' },
    'seabank': { icon: CreditCard, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'seabank.co.id' },
    'neobank': { icon: CreditCard, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'bankneocommerce.co.id' },
    'neo bank': { icon: CreditCard, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'bankneocommerce.co.id' },
    'tiktok': { icon: Smartphone, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'tiktok.com' },
    'tiktok paylater': { icon: CreditCard, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'tiktok.com' },
    // --- FINTECH & INVESTMENT ---
    'bibit': { icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'bibit.id' },
    'ajaib': { icon: TrendingUp, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'ajaib.co.id' },
    'stockbit': { icon: TrendingUp, color: 'text-emerald-700', bgColor: 'bg-emerald-100', domain: 'stockbit.com' },
    'pluang': { icon: TrendingUp, color: 'text-amber-500', bgColor: 'bg-amber-50', domain: 'pluang.com' },
    'indodax': { icon: TrendingUp, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'indodax.com' },
    'pintu': { icon: TrendingUp, color: 'text-zinc-900', bgColor: 'bg-zinc-100', domain: 'pintu.co.id' },
    'tokocrypto': { icon: TrendingUp, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'tokocrypto.com' },
    'binance': { icon: TrendingUp, color: 'text-yellow-500', bgColor: 'bg-zinc-900', domain: 'binance.com' },
    'bareksa': { icon: TrendingUp, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'bareksa.com' },
    'wise': { icon: CreditCard, color: 'text-emerald-500', bgColor: 'bg-emerald-50', domain: 'wise.com' },
    'paypal': { icon: CreditCard, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'paypal.com' },
    'flip': { icon: Smartphone, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'flip.id' },
    'midtrans': { icon: Smartphone, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'midtrans.com' },
    'xendit': { icon: Smartphone, color: 'text-blue-900', bgColor: 'bg-blue-50', domain: 'xendit.co' },



    // --- TELECOM & UTILITIES ---
    'telkomsel': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'telkomsel.com' },
    'tsel': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'telkomsel.com' },
    'halo': { icon: Smartphone, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'telkomsel.com' },
    'indosat': { icon: Smartphone, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'indosatooredoo.com' },
    'im3': { icon: Smartphone, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'indosatooredoo.com' },
    'xl': { icon: Smartphone, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'xl.co.id' },
    'axis': { icon: Smartphone, color: 'text-purple-600', bgColor: 'bg-purple-50', domain: 'axis.co.id' },
    'smartfren': { icon: Smartphone, color: 'text-rose-500', bgColor: 'bg-rose-50', domain: 'smartfren.com' },
    'indihome': { icon: Wifi, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'indihome.co.id' },
    'biznet': { icon: Wifi, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'biznetnetworks.com' },
    'first media': { icon: Wifi, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'firstmedia.com' },
    'pln': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50', domain: 'plnsc.co.id' },
    'listrik': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50', domain: 'plnsc.co.id' },
    'token': { icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50', domain: 'plnsc.co.id' },
    'pdam': { icon: Droplets, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'pdam.co.id' },
    'kai': { icon: Train, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'kai.id' },
    'kereta': { icon: Train, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'kai.id' },
    // --- LOGISTICS ---
    'jne': { icon: Package, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'jne.co.id' },
    'j&t': { icon: Truck, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'jet.co.id' },
    'sicepat': { icon: Truck, color: 'text-rose-700', bgColor: 'bg-rose-100', domain: 'sicepat.com' },
    'anteraja': { icon: Package, color: 'text-pink-600', bgColor: 'bg-pink-50', domain: 'anteraja.id' },
    // --- HEALTH ---
    'halodoc': { icon: Stethoscope, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'halodoc.com' },
    'alodokter': { icon: Stethoscope, color: 'text-blue-500', bgColor: 'bg-blue-50', domain: 'alodokter.com' },
    'k24': { icon: Stethoscope, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'apotek-k24.com' },
    'apotek k-24': { icon: Stethoscope, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'apotek-k24.com' },
    'kimia farma': { icon: Stethoscope, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'kimiafarmaapotek.co.id' },
    'siloam': { icon: Stethoscope, color: 'text-indigo-700', bgColor: 'bg-indigo-50', domain: 'siloamhospitals.com' },
    'hermina': { icon: Stethoscope, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'herminahospitals.com' },
    'rs pondok indah': { icon: Stethoscope, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'rspondokindah.co.id' },
    'prodia': { icon: Stethoscope, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'prodia.co.id' },
    'lab': { icon: Stethoscope, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
    'apotek': { icon: Stethoscope, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    'obat': { icon: Stethoscope, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    'dokter': { icon: Stethoscope, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'klinik': { icon: Stethoscope, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'hospital': { icon: Stethoscope, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    // --- GOLD INVESTMENT (EMAS) ---
    'pegadaian': { icon: Coins, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'pegadaian.co.id' },
    'antam': { icon: Coins, color: 'text-yellow-700', bgColor: 'bg-yellow-50', domain: 'logammulia.com' },
    'logam mulia': { icon: Coins, color: 'text-yellow-700', bgColor: 'bg-yellow-50', domain: 'logammulia.com' },
    'treasury': { icon: Coins, color: 'text-amber-600', bgColor: 'bg-amber-50', domain: 'treasury.id' },
    'lakuemas': { icon: Coins, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'lakuemas.com' },
    'emas': { icon: Coins, color: 'text-yellow-600', bgColor: 'bg-yellow-50', domain: 'logammulia.com' },

    // --- EDUCATION ---
    'ruangguru': { icon: GraduationCap, color: 'text-blue-600', bgColor: 'bg-blue-50', domain: 'ruangguru.com' },
    'zenius': { icon: GraduationCap, color: 'text-purple-600', bgColor: 'bg-purple-50', domain: 'zenius.net' },
    'udemy': { icon: GraduationCap, color: 'text-indigo-600', bgColor: 'bg-indigo-50', domain: 'udemy.com' },
    'coursera': { icon: GraduationCap, color: 'text-blue-700', bgColor: 'bg-blue-50', domain: 'coursera.org' },
    'duolingo': { icon: GraduationCap, color: 'text-emerald-500', bgColor: 'bg-emerald-50', domain: 'duolingo.com' },

    // --- LIFESTYLE & GYM ---
    'fitness first': { icon: Dumbbell, color: 'text-blue-800', bgColor: 'bg-blue-50', domain: 'fitnessfirst.co.id' },
    'celebrity fitness': { icon: Dumbbell, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'celebrityfitness.co.id' },
    'gym': { icon: Dumbbell, color: 'text-slate-700', bgColor: 'bg-slate-100' },
    'cinema xxi': { icon: Ticket, color: 'text-amber-600', bgColor: 'bg-amber-50', domain: '21cineplex.com' },
    'cgv': { icon: Ticket, color: 'text-rose-600', bgColor: 'bg-rose-50', domain: 'cgv.id' },
    'xxi': { icon: Ticket, color: 'text-amber-600', bgColor: 'bg-amber-50', domain: '21cineplex.com' },

    // --- SOCIAL & GOV ---
    'kitabisa': { icon: Heart, color: 'text-cyan-500', bgColor: 'bg-cyan-50', domain: 'kitabisa.com' },
    'rumah zakat': { icon: Heart, color: 'text-orange-600', bgColor: 'bg-orange-50', domain: 'rumahzakat.org' },
    'baznas': { icon: Heart, color: 'text-emerald-700', bgColor: 'bg-emerald-50', domain: 'baznas.go.id' },
    'pajak': { icon: ShieldCheck, color: 'text-blue-900', bgColor: 'bg-blue-50', domain: 'pajak.go.id' },
    'sim': { icon: ShieldCheck, color: 'text-blue-800', bgColor: 'bg-blue-50' },
    'paspor': { icon: ShieldCheck, color: 'text-blue-700', bgColor: 'bg-blue-50' },
    'bpjs': { icon: ShieldCheck, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'bpjs-kesehatan.go.id' },
    'samsat': { icon: ShieldCheck, color: 'text-blue-800', bgColor: 'bg-blue-50' },
    'stnk': { icon: ShieldCheck, color: 'text-blue-800', bgColor: 'bg-blue-50' },
    'pbb': { icon: ShieldCheck, color: 'text-blue-900', bgColor: 'bg-blue-50' },
    'dompet dhuafa': { icon: Heart, color: 'text-emerald-600', bgColor: 'bg-emerald-50', domain: 'dompetdhuafa.org' },


};

/**
 * Gets real-world logo URL.
 * Uses Logo.dev via our API proxy as primary, Clearbit as secondary.
 */
export function getMerchantLogoUrl(domain?: string): string | null {
    if (!domain) return null;

    // Use our Logo API route as primary - it will redirect to the actual logo
    return `/api/logo/${domain}`;
}

/**
 * Fallback logo service if primary fails.
 * Uses Clearbit as secondary fallback.
 */
export function getBackupLogoUrl(domain?: string): string | null {
    if (!domain) return null;

    // Use Clearbit as secondary fallback
    return `https://logo.clearbit.com/${domain}?size=128`;
}

/**
 * Last resort logo service.
 * Uses Google Favicons (reliable but lower quality).
 */
export function getGoogleFaviconUrl(domain?: string): string | null {
    if (!domain) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export function getMerchantVisuals(merchantName?: string | null): MerchantVisuals | null {
    if (!merchantName) return null;

    const normalized = merchantName.toLowerCase().trim();

    // 1. Direct Match
    if (MERCHANT_MAP[normalized]) return MERCHANT_MAP[normalized];

    // 2. Powerful Partial Match: Check if any key in MERCHANT_MAP is contained within the string
    // This handles "Beli Starbucks", "Bayar Netflix", etc.
    const keys = Object.keys(MERCHANT_MAP);
    for (const key of keys) {
        if (normalized.includes(key)) {
            return MERCHANT_MAP[key];
        }
    }

    return null;
}
