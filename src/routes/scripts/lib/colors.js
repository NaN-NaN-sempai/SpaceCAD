class Color {
    static names = {
        "black": "#000000",
        "silver": "#c0c0c0",
        "gray": "#808080",
        "white": "#ffffff",
        "maroon": "#800000",
        "red": "#ff0000",
        "purple": "#800080",
        "fuchsia": "#ff00ff",
        "green": "#008000",
        "lime": "#00ff00",
        "olive": "#808000",
        "yellow": "#ffff00",
        "navy": "#000080",
        "blue": "#0000ff",
        "teal": "#008080",
        "aqua": "#00ffff",
        "aliceblue": "#f0f8ff",
        "antiquewhite": "#faebd7",
        "aquamarine": "#7fffd4",
        "azure": "#f0ffff",
        "beige": "#f5f5dc",
        "bisque": "#ffe4c4",
        "blanchedalmond": "#ffebcd",
        "blueviolet": "#8a2be2",
        "brown": "#a52a2a",
        "burlywood": "#deb887",
        "cadetblue": "#5f9ea0",
        "chartreuse": "#7fff00",
        "chocolate": "#d2691e",
        "coral": "#ff7f50",
        "cornflowerblue": "#6495ed",
        "cornsilk": "#fff8dc",
        "crimson": "#dc143c",
        "cyan": "#00ffff",
        "darkblue": "#00008b",
        "darkcyan": "#008b8b",
        "darkgoldenrod": "#b8860b",
        "darkgray": "#a9a9a9",
        "darkgreen": "#006400",
        "darkgrey": "#a9a9a9",
        "darkkhaki": "#bdb76b",
        "darkmagenta": "#8b008b",
        "darkolivegreen": "#556b2f",
        "darkorange": "#ff8c00",
        "darkorchid": "#9932cc",
        "darkred": "#8b0000",
        "darksalmon": "#e9967a",
        "darkseagreen": "#8fbc8f",
        "darkslateblue": "#483d8b",
        "darkslategray": "#2f4f4f",
        "darkslategrey": "#2f4f4f",
        "darkturquoise": "#00ced1",
        "darkviolet": "#9400d3",
        "deeppink": "#ff1493",
        "deepskyblue": "#00bfff",
        "dimgray": "#696969",
        "dimgrey": "#696969",
        "dodgerblue": "#1e90ff",
        "firebrick": "#b22222",
        "floralwhite": "#fffaf0",
        "forestgreen": "#228b22",
        "gainsboro": "#dcdcdc",
        "ghostwhite": "#f8f8ff",
        "gold": "#ffd700",
        "goldenrod": "#daa520",
        "greenyellow": "#adff2f",
        "grey": "#808080",
        "honeydew": "#f0fff0",
        "hotpink": "#ff69b4",
        "indianred": "#cd5c5c",
        "indigo": "#4b0082",
        "ivory": "#fffff0",
        "khaki": "#f0e68c",
        "lavender": "#e6e6fa",
        "lavenderblush": "#fff0f5",
        "lawngreen": "#7cfc00",
        "lemonchiffon": "#fffacd",
        "lightblue": "#add8e6",
        "lightcoral": "#f08080",
        "lightcyan": "#e0ffff",
        "lightgoldenrodyellow": "#fafad2",
        "lightgray": "#d3d3d3",
        "lightgreen": "#90ee90",
        "lightgrey": "#d3d3d3",
        "lightpink": "#ffb6c1",
        "lightsalmon": "#ffa07a",
        "lightseagreen": "#20b2aa",
        "lightskyblue": "#87cefa",
        "lightslategray": "#778899",
        "lightslategrey": "#778899",
        "lightsteelblue": "#b0c4de",
        "lightyellow": "#ffffe0",
        "limegreen": "#32cd32",
        "linen": "#faf0e6",
        "magenta": "#ff00ff",
        "mediumaquamarine": "#66cdaa",
        "mediumblue": "#0000cd",
        "mediumorchid": "#ba55d3",
        "mediumpurple": "#9370db",
        "mediumseagreen": "#3cb371",
        "mediumslateblue": "#7b68ee",
        "mediumspringgreen": "#00fa9a",
        "mediumturquoise": "#48d1cc",
        "mediumvioletred": "#c71585",
        "midnightblue": "#191970",
        "mintcream": "#f5fffa",
        "mistyrose": "#ffe4e1",
        "moccasin": "#ffe4b5",
        "navajowhite": "#ffdead",
        "oldlace": "#fdf5e6",
        "olivedrab": "#6b8e23",
        "orange": "#ffa500",
        "orangered": "#ff4500",
        "orchid": "#da70d6",
        "palegoldenrod": "#eee8aa",
        "palegreen": "#98fb98",
        "paleturquoise": "#afeeee",
        "palevioletred": "#db7093",
        "papayawhip": "#ffefd5",
        "peachpuff": "#ffdab9",
        "peru": "#cd853f",
        "pink": "#ffc0cb",
        "plum": "#dda0dd",
        "powderblue": "#b0e0e6",
        "rebeccapurple": "#663399",
        "rosybrown": "#bc8f8f",
        "royalblue": "#4169e1",
        "saddlebrown": "#8b4513",
        "salmon": "#fa8072",
        "sandybrown": "#f4a460",
        "seagreen": "#2e8b57",
        "seashell": "#fff5ee",
        "sienna": "#a0522d",
        "skyblue": "#87ceeb",
        "slateblue": "#6a5acd",
        "slategray": "#708090",
        "slategrey": "#708090",
        "snow": "#fffafa",
        "springgreen": "#00ff7f",
        "steelblue": "#4682b4",
        "tan": "#d2b48c",
        "thistle": "#d8bfd8",
        "tomato": "#ff6347",
        "transparent": "#00000000",
        "turquoise": "#40e0d0",
        "violet": "#ee82ee",
        "wheat": "#f5deb3",
        "whitesmoke": "#f5f5f5",
        "yellowgreen": "#9acd32"
    }

    
    static color = (...args) => {
        const instance = new Color(...args);

        return instance.output
    }
    static GlobalizeNames = () => 
        Object.entries(Color.names).forEach(([key]) => window[key] = Color.color(key));

    static err = msg => {
        msg = "Color class Error: " + msg;
        logger.throw(msg);
    }
    static getStrVal = str => {
        let val;
        if(str.includes(","))
            val = str.split(",");
        else if(str.includes(" "))
            val = str.split(" ");

        return val;
    }
    static asPorc = str => {
        if(typeof str == "number") return str;
        if(str.includes("%")) return eval(str.replace("%", "")) / 100;
        else {
            let val = eval(str);

            if(val > 1) return 1;
            else if(val < 0) return 0;
            else return val;
        }
    }

    static defaultOutputType = "three";

    static setProperties = (obj, inst) => {
        Object.defineProperties(obj, {
            output: {
                get: () => {
                    return inst.Output();
                }
            },
            str: {
                get: () => {
                    return inst.outputString();
                }
            },
            asHEX: {
                get: () => {
                    return inst.toHEX();
                }
            },
            asRGB: {
                get: () => {
                    return inst.toRGB();
                }
            },
            asHSL: {
                get: () => {
                    return inst.toHSL();
                }
            },
            asHWB: {
                get: () => {
                    return inst.toHWB();
                }
            },
            asLAB: {
                get: () => {
                    return inst.toLAB();
                }
            },
            asLCH: {
                get: () => {
                    return inst.toLCH();
                }
            },
            asOKLAB: {
                get: () => {
                    return inst.toOKLAB();
                }
            },
            asOKLCH: {
                get: () => {
                    return inst.toOKLCH();
                }
            },
        })
    }
    static ColorRoot = class ColorRoot {
        constructor(type) {
            this.type = type;

            Color.setProperties(this, this);
        }

        getInstance() {
            if( 
                this instanceof String ||
                window.THREE != undefined && this instanceof THREE.Color
            ) return this.ColorInstance;
            else return this;
        }

        mix(color, amount = 0.5) {
            const instance = this.getInstance();

            if(!(color instanceof ColorRoot)) 
                color = new Color(color);

            amount = Color.asPorc(amount);

            const rgb = instance.asRGB;
            color = color.asRGB;

            const colorArr = [
                Math.round(rgb.r * (1 - amount) + color.r * amount),
                Math.round(rgb.g * (1 - amount) + color.g * amount),
                Math.round(rgb.b * (1 - amount) + color.b * amount),
            ];

            if(rgb.hasAlpha)
                colorArr.push(Math.round(rgb.alpha * (1 - amount) + (color.alpha ?? 1) * amount));

            let newColor;

            if(instance.type != "named") newColor  = new Color(colorArr).to(instance.type);
            else newColor = new Color(colorArr);

            return newColor.output;
        }

        darken(amount = 0.1) {
            const instance = this.getInstance();
            return instance.mix(black, amount); 
        }
        lighten(amount = 0.1) {
            const instance = this.getInstance();
            return instance.mix(white, amount);
        }


        static setupProps = (obj, instance) => {
            getClassMethods(instance)
            .forEach(([key, value]) => obj[key] = value);
            
            obj.ColorInstance = instance;
            instance.ColorParent = obj;

            Color.setProperties(obj, instance);
        }
        outputTHREE() {
            const instance = this.getInstance();
            if(window.THREE != undefined) {
                const { r, g, b } = instance.asRGB;
                const color = new THREE.Color(r/255, g/255, b/255);
                ColorRoot.setupProps(color, instance);
                return color;
            } else {
                logger.warn("THREE is not loaded");
            }

            return this.outputStringObject();
        }
        outputString() {
            const instance = this.getInstance();
            const { type } = instance;
            let output;
            
            if(type == "hex") output = instance.toString();
            if(type == "named") output = instance.hex.toString();
            if(type == "rgb") output = `rgb${instance.hasAlpha ? "a" : ""}(${instance.r}, ${instance.g}, ${instance.b}${instance.hasAlpha ? `, ${instance.alpha}` : ""})`;
            if(type == "hsl")
                output = `hsl${instance.hasAlpha ? "a" : ""}(${instance.h}, ${instance.s * 100}%, ${instance.l * 100}%${instance.hasAlpha ? `, ${instance.alpha}` : ""})`;
            if(type == "hwb")
                output = `hwb(${instance.h}, ${instance.w * 100}%, ${instance.b * 100}%${instance.hasAlpha ? `, ${instance.alpha}` : ""})`;
            if(type == "lab")
                output = `lab(${instance.l * 100}% ${instance.a} ${instance.b}${instance.hasAlpha ? ` / ${instance.alpha}` : ""})`;
            if(type == "lch")
                output = `lch(${instance.l * 100}% ${instance.c} ${instance.h}${instance.hasAlpha ? ` / ${instance.alpha}` : ""})`;
            if(type == "oklab")
                output = `oklab(${instance.l * 100}% ${instance.a} ${instance.b}${instance.hasAlpha ? ` / ${instance.alpha}` : ""})`;
            if(type == "oklch")
                output = `oklch(${instance.l * 100}% ${instance.c} ${instance.h}${instance.hasAlpha ? ` / ${instance.alpha}` : ""})`;
            
            return output;
        }
        outputStringObject() {
            const instance = this.getInstance();
            const { type } = instance;
            const str = this.outputString();


            const output = new String(str);
            ColorRoot.setupProps(output, instance);
            output.stringInstance = true;

            return output;
        }
        Output(ignoreDefault = false) {
            if(!ignoreDefault) {
                if(this.outputType == "three") return this.outputTHREE();
                if(this.outputType == "string") return this.outputStringObject();
            }
            
            return this.outputString();  
        }

        to(type) {
            const instance = this.getInstance();

            if(type == "hex") return instance.toHEX();
            if(type == "rgb") return instance.toRGB();
            if(type == "hsl") return instance.toHSL();
            if(type == "hwb") return instance.toHWB();
            if(type == "lab") return instance.toLAB();
            if(type == "lch") return instance.toLCH();
            if(type == "oklab") return instance.toOKLAB();
            if(type == "oklch") return instance.toOKLCH();
        }

        toHEX() {
            const pad16 = n => n.toString(16).padStart(2, "0");
            const hex = n => pad16(Math.round(n));
            const hex255 = n => pad16(Math.round(n * 255));            
            const hex255MinMax = n => pad16(Math.round(Math.max(0, Math.min(1, n)) * 255));

            const instance = this.getInstance();
            const { type } = instance;

            if(type == "rgb") {
                const { r, g, b, alpha } = instance;
                return new Color.HEX(`#${hex(r)}${hex(g)}${hex(b)}${instance.hasAlpha ? hex255MinMax(alpha) : ""}`);
            }

            if (type == "named")
                return instance.hex;

            if(type == "hsl") {
                const { h, s, l } = instance;
                
                const hue = (p, q, t) => {
                    if(t < 0) t += 1;
                    if(t > 1) t -= 1;

                    if(t < 1 / 6) return p + (q - p) * 6 * t;
                    if(t < 1 / 2) return q;
                    if(t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

                    return p;
                };

                let r, g, b;

                if(s === 0) {
                    r = g = b = l;
                } else {
                    const q = l < 0.5
                        ? l * (1 + s)
                        : l + s - l * s;

                    const p = 2 * l - q;

                    r = hue(p, q, h + 1 / 3);
                    g = hue(p, q, h);
                    b = hue(p, q, h - 1 / 3);
                }


                return new Color.HEX(`#${hex255(r)}${hex255(g)}${hex255(b)}${instance.hasAlpha ? hex255(instance.alpha) : ""}`);
            }

            if(type == "hwb") {
                let { h, w, b } = instance;

                if(w + b >= 1) {
                    const v = w / (w + b);

                    return new Color.HEX(`#${hex255(v)}${hex255(v)}${hex255(v)}${instance.hasAlpha ? hex255(instance.alpha) : ""}`);
                }

                h /= 60;

                const x = 1 - Math.abs((h % 2) - 1);

                let r, g, bl;

                if(h < 1)      [r, g, bl] = [1, x, 0];
                else if(h < 2) [r, g, bl] = [x, 1, 0];
                else if(h < 3) [r, g, bl] = [0, 1, x];
                else if(h < 4) [r, g, bl] = [0, x, 1];
                else if(h < 5) [r, g, bl] = [x, 0, 1];
                else           [r, g, bl] = [1, 0, x];

                const factor = 1 - w - b;

                r = r * factor + w;
                g = g * factor + w;
                bl = bl * factor + w;

                return new Color.HEX(`#${hex255(r)}${hex255(g)}${hex255(bl)}${instance.hasAlpha ? hex255(instance.alpha) : ""}`);
            }

            if(type == "lab") {
                const L = instance.l * 100;
                const a = instance.a;
                const b = instance.b;

                // LAB → XYZ (D65)
                const fy = (L + 16) / 116;
                const fx = fy + a / 500;
                const fz = fy - b / 200;

                const f = t =>
                    t ** 3 > 216 / 24389
                        ? t ** 3
                        : (116 * t - 16) / (24389 / 27);

                const X = 0.95047 * f(fx);
                const Y = 1.00000 * f(fy);
                const Z = 1.08883 * f(fz);

                // XYZ → sRGB
                let r =  3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
                let g = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
                let bl = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;

                // Linear RGB → sRGB
                const gamma = n =>
                    n <= 0.0031308
                        ? 12.92 * n
                        : 1.055 * Math.pow(n, 1 / 2.4) - 0.055;

                r = gamma(r);
                g = gamma(g);
                bl = gamma(bl);


                return new Color.HEX(`#${hex255MinMax(r)}${hex255MinMax(g)}${hex255MinMax(bl)}${instance.hasAlpha ? hex255MinMax(instance.alpha) : ""}`);
            }

            if(type == "lch") {
                const L = instance.l * 100;
                const h = instance.h * Math.PI / 180;

                const a = instance.c * Math.cos(h);
                const b = instance.c * Math.sin(h);

                // LAB → XYZ
                const fy = (L + 16) / 116;
                const fx = fy + a / 500;
                const fz = fy - b / 200;

                const f = t =>
                    t ** 3 > 216 / 24389
                        ? t ** 3
                        : (116 * t - 16) / (24389 / 27);

                const X = 0.95047 * f(fx);
                const Y = 1.00000 * f(fy);
                const Z = 1.08883 * f(fz);

                // XYZ → linear RGB
                let r =  3.2404542 * X - 1.5371385 * Y - 0.4985314 * Z;
                let g = -0.9692660 * X + 1.8760108 * Y + 0.0415560 * Z;
                let bl = 0.0556434 * X - 0.2040259 * Y + 1.0572252 * Z;

                // Linear RGB → sRGB
                const gamma = n =>
                    n <= 0.0031308
                        ? 12.92 * n
                        : 1.055 * Math.pow(n, 1 / 2.4) - 0.055;

                r = gamma(r);
                g = gamma(g);
                bl = gamma(bl);


                return new Color.HEX(`#${hex255MinMax(r)}${hex255MinMax(g)}${hex255MinMax(bl)}${instance.hasAlpha ? hex255MinMax(instance.alpha) : ""}`);
            }
            
            if(type == "oklab") {
                const l = instance.l;
                const a = instance.a;
                const b = instance.b;

                // OKLab → LMS
                const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
                const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
                const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

                const L = l_ ** 3;
                const M = m_ ** 3;
                const S = s_ ** 3;

                // LMS → linear sRGB
                let r =  4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
                let g = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
                let bl = -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S;

                // linear sRGB → sRGB
                const gamma = n =>
                    n <= 0.0031308
                        ? 12.92 * n
                        : 1.055 * Math.pow(n, 1 / 2.4) - 0.055;

                r = gamma(r);
                g = gamma(g);
                bl = gamma(bl);


                return new Color.HEX(`#${hex255MinMax(r)}${hex255MinMax(g)}${hex255MinMax(bl)}${instance.hasAlpha ? hex255MinMax(instance.alpha) : ""}`);
            }

            if(type == "oklch") {
                const h = instance.h * Math.PI / 180;

                const l = instance.l;
                const a = instance.c * Math.cos(h);
                const b = instance.c * Math.sin(h);

                // OKLab → LMS
                const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
                const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
                const s_ = l - 0.0894841775 * a - 1.2914855480 * b;

                const L = l_ ** 3;
                const M = m_ ** 3;
                const S = s_ ** 3;

                // LMS → linear sRGB
                let r =  4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S;
                let g = -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S;
                let bl = -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S;

                // linear sRGB → sRGB
                const gamma = n =>
                    n <= 0.0031308
                        ? 12.92 * n
                        : 1.055 * Math.pow(n, 1 / 2.4) - 0.055;

                r = gamma(r);
                g = gamma(g);
                bl = gamma(bl);

                return new Color.HEX(`#${hex255MinMax(r)}${hex255MinMax(g)}${hex255MinMax(bl)}${instance.hasAlpha ? hex255MinMax(instance.alpha) : ""}`);
            }

            return instance;
        }

        toRGB() {
            const instance = this.getInstance();
            const {type} = instance;
            if(type == "hex") {
                let hex = instance.noSharp();

                if(hex.length == 3 || hex.length == 4)
                    hex = [...hex].map(v => v + v).join("");

                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);

                const a = hex.length == 8
                    ? parseInt(hex.slice(6, 8), 16) / 255
                    : null;

                return new Color.RGB(r, g, b, a);
            }

            if(type == "named")
                return instance.hex.toRGB();


            if(type == "rgb")
                return instance;
            
            
            return instance.toHEX().toRGB();
        }

        toHSL() {
            const instance = this.getInstance();
            const {type} = instance;
            if(type == "hex") {
                let hex = instance.noSharp();

                if(hex.length == 3 || hex.length == 4)
                    hex = [...hex].map(v => v + v).join("");

                const r = parseInt(hex.slice(0, 2), 16) / 255;
                const g = parseInt(hex.slice(2, 4), 16) / 255;
                const b = parseInt(hex.slice(4, 6), 16) / 255;

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const d = max - min;

                let h = 0;
                let s = 0;
                const l = (max + min) / 2;

                if(d !== 0) {
                    s = d / (1 - Math.abs(2 * l - 1));

                    if(max === r)
                        h = 60 * (((g - b) / d) % 6);
                    else if(max === g)
                        h = 60 * ((b - r) / d + 2);
                    else
                        h = 60 * ((r - g) / d + 4);

                    if(h < 0)
                        h += 360;
                }

                const a = hex.length == 8
                    ? parseInt(hex.slice(6, 8), 16) / 255
                    : null;

                return new Color.HSL(h, s, l, a);
            }

            if(type == "named")
                return instance.hex.toHSL();


            if(type == "hsl")
                return instance;
            
            return instance.toHEX().toHSL();
        }

        toHWB() {
            const instance = this.getInstance();
            const {type} = instance;

            if(type == "hex") {
                let hex = instance.noSharp();

                if(hex.length == 3 || hex.length == 4)
                    hex = [...hex].map(v => v + v).join("");

                const r = parseInt(hex.slice(0, 2), 16) / 255;
                const g = parseInt(hex.slice(2, 4), 16) / 255;
                const b = parseInt(hex.slice(4, 6), 16) / 255;

                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);

                let h = 0;

                if(max !== min) {
                    const d = max - min;

                    if(max === r)
                        h = 60 * (((g - b) / d) % 6);
                    else if(max === g)
                        h = 60 * ((b - r) / d + 2);
                    else
                        h = 60 * ((r - g) / d + 4);

                    if(h < 0)
                        h += 360;
                }

                const w = min;
                const bl = 1 - max;

                const a = hex.length == 8
                    ? parseInt(hex.slice(6, 8), 16) / 255
                    : null;

                return new Color.HWB(h, w, bl, a);
            }

            if(type == "named")
                return instance.hex.toHWB();


            if(type == "hwb")
                return instance;
            
            return instance.toHEX().toHWB();
        }

        toLAB() {
            const instance = this.getInstance();
            const {type} = instance;

            if(type == "hex") {
                let hex = instance.noSharp();

                if(hex.length == 3 || hex.length == 4)
                    hex = [...hex].map(v => v + v).join("");

                // HEX → sRGB
                const srgb = [
                    parseInt(hex.slice(0, 2), 16) / 255,
                    parseInt(hex.slice(2, 4), 16) / 255,
                    parseInt(hex.slice(4, 6), 16) / 255
                ];

                // sRGB → linear RGB
                const rgb = srgb.map(v =>
                    v <= 0.04045
                        ? v / 12.92
                        : ((v + 0.055) / 1.055) ** 2.4
                );

                // linear RGB → XYZ
                const X = 0.4124564 * rgb[0] +
                        0.3575761 * rgb[1] +
                        0.1804375 * rgb[2];

                const Y = 0.2126729 * rgb[0] +
                        0.7151522 * rgb[1] +
                        0.0721750 * rgb[2];

                const Z = 0.0193339 * rgb[0] +
                        0.1191920 * rgb[1] +
                        0.9503041 * rgb[2];

                // XYZ → LAB
                const f = v =>
                    v > 216 / 24389
                        ? Math.cbrt(v)
                        : (24389 / 27 * v + 16) / 116;

                const fx = f(X / 0.95047);
                const fy = f(Y / 1.00000);
                const fz = f(Z / 1.08883);

                const l = (116 * fy - 16) / 100;
                const a = 500 * (fx - fy);
                const b = 200 * (fy - fz);

                const alpha = hex.length == 8
                    ? parseInt(hex.slice(6, 8), 16) / 255
                    : null;

                return new Color.LAB(l, a, b, alpha);
            }

            if(type == "named")
                return instance.hex.toLAB();

            if(type == "lab")
                return instance;

            return instance.toHEX().toLAB();
        }

        toLCH() {
            const instance = this.getInstance();
            const {type} = instance;
            
            if(type == "hex") {
                let hex = instance.noSharp();

                if(hex.length == 3 || hex.length == 4)
                    hex = [...hex].map(v => v + v).join("");

                // HEX → sRGB
                const srgb = [
                    parseInt(hex.slice(0, 2), 16) / 255,
                    parseInt(hex.slice(2, 4), 16) / 255,
                    parseInt(hex.slice(4, 6), 16) / 255
                ];

                // sRGB → linear RGB
                const rgb = srgb.map(v =>
                    v <= 0.04045
                        ? v / 12.92
                        : ((v + 0.055) / 1.055) ** 2.4
                );

                // linear RGB → XYZ
                const X = 0.4124564 * rgb[0] +
                        0.3575761 * rgb[1] +
                        0.1804375 * rgb[2];

                const Y = 0.2126729 * rgb[0] +
                        0.7151522 * rgb[1] +
                        0.0721750 * rgb[2];

                const Z = 0.0193339 * rgb[0] +
                        0.1191920 * rgb[1] +
                        0.9503041 * rgb[2];

                // XYZ → LAB
                const f = v =>
                    v > 216 / 24389
                        ? Math.cbrt(v)
                        : (24389 / 27 * v + 16) / 116;

                const fx = f(X / 0.95047);
                const fy = f(Y);
                const fz = f(Z / 1.08883);

                const l = (116 * fy - 16) / 100;
                const a = 500 * (fx - fy);
                const b = 200 * (fy - fz);

                // LAB → LCH
                const c = Math.sqrt(a ** 2 + b ** 2);

                let h = Math.atan2(b, a) * 180 / Math.PI;

                if(h < 0)
                    h += 360;

                const alpha = hex.length == 8
                    ? parseInt(hex.slice(6, 8), 16) / 255
                    : null;

                return new Color.LCH(l, c, h, alpha);
            }

            if(type == "named")
                return instance.hex.toLCH();

            if(type == "lch")
                return instance;

            return instance.toHEX().toLCH();
        }

        toOKLAB() {
            const instance = this.getInstance();
            const {type} = instance;
            
            if(type == "hex") {
                let hex = instance.noSharp();

                if(hex.length == 3 || hex.length == 4)
                    hex = [...hex].map(v => v + v).join("");

                // HEX → sRGB
                const srgb = [
                    parseInt(hex.slice(0, 2), 16) / 255,
                    parseInt(hex.slice(2, 4), 16) / 255,
                    parseInt(hex.slice(4, 6), 16) / 255
                ];

                // sRGB → linear RGB
                const rgb = srgb.map(v =>
                    v <= 0.04045
                        ? v / 12.92
                        : ((v + 0.055) / 1.055) ** 2.4
                );

                // linear RGB → LMS
                const l = 0.4122214708 * rgb[0] +
                        0.5363325363 * rgb[1] +
                        0.0514459929 * rgb[2];

                const m = 0.2119034982 * rgb[0] +
                        0.6806995451 * rgb[1] +
                        0.1073969566 * rgb[2];

                const s = 0.0883024619 * rgb[0] +
                        0.2817188376 * rgb[1] +
                        0.6299787005 * rgb[2];

                const l_ = Math.cbrt(l);
                const m_ = Math.cbrt(m);
                const s_ = Math.cbrt(s);

                // LMS → OKLab
                const L = 0.2104542553 * l_ +
                        0.7936177850 * m_ -
                        0.0040720468 * s_;

                const a = 1.9779984951 * l_ -
                        2.4285922050 * m_ +
                        0.4505937099 * s_;

                const b = 0.0259040371 * l_ +
                        0.7827717662 * m_ -
                        0.8086757660 * s_;

                const alpha = hex.length == 8
                    ? parseInt(hex.slice(6, 8), 16) / 255
                    : null;

                return new Color.OKLAB(L, a, b, alpha);
            }

            if(type == "named")
                return instance.hex.toOKLAB();

            if(type == "oklab")
                return instance;

            return instance.toHEX().toOKLAB();
        }

        toOKLCH() {
            const instance = this.getInstance();
            const {type} = instance;
            
            if(type == "hex") {
                let hex = instance.noSharp();
                if(hex.length == 3 || hex.length == 4)
                    hex = [...hex].map(v => v + v).join("");

                // HEX → sRGB
                const srgb = [
                    parseInt(hex.slice(0, 2), 16) / 255,
                    parseInt(hex.slice(2, 4), 16) / 255,
                    parseInt(hex.slice(4, 6), 16) / 255
                ];

                // sRGB → linear RGB
                const rgb = srgb.map(v =>
                    v <= 0.04045
                        ? v / 12.92
                        : ((v + 0.055) / 1.055) ** 2.4
                );

                // linear RGB → LMS
                const l = 0.4122214708 * rgb[0] +
                        0.5363325363 * rgb[1] +
                        0.0514459929 * rgb[2];

                const m = 0.2119034982 * rgb[0] +
                        0.6806995451 * rgb[1] +
                        0.1073969566 * rgb[2];

                const s = 0.0883024619 * rgb[0] +
                        0.2817188376 * rgb[1] +
                        0.6299787005 * rgb[2];

                const l_ = Math.cbrt(l);
                const m_ = Math.cbrt(m);
                const s_ = Math.cbrt(s);

                // LMS → OKLab
                const L = 0.2104542553 * l_ +
                        0.7936177850 * m_ -
                        0.0040720468 * s_;

                const a = 1.9779984951 * l_ -
                        2.4285922050 * m_ +
                        0.4505937099 * s_;

                const b = 0.0259040371 * l_ +
                        0.7827717662 * m_ -
                        0.8086757660 * s_;

                // OKLab → OKLCH
                const c = Math.sqrt(a ** 2 + b ** 2);

                let h = Math.atan2(b, a) * 180 / Math.PI;

                if(h < 0)
                    h += 360;

                const alpha = hex.length == 8
                    ? parseInt(hex.slice(6, 8), 16) / 255
                    : null;

                return new Color.OKLCH(L, c, h, alpha);
            }

            if(type == "named")
                return instance.hex.toOKLCH();

            if(type == "oklch")
                return instance;

            return instance.toHEX().toOKLCH();            
        }
    }
    static HEX = class hexColor extends Color.ColorRoot {
        constructor(hex) {
            if(typeof hex == "string") {
                hex = hex.trim();
                hex = hex.startsWith("#") ? hex : "#" + hex;
            }

            if(
                typeof hex == "string" && 
                ![4, 5, 7, 9].includes(hex.length) ||
                typeof hex == "number" && 
                ![3, 4, 6, 8].includes(hex.toString(16).length)
            ) Color.err(`Invalid hex color format: ${hex}`);

            super("hex");
            this.hex = hex;
            this.hexType = typeof hex == "string" ? "string" : "number";
            this.hasAlpha = this.hexType == "string"
                ? this.hex.length == 5 || this.hex.length == 9
                : [4, 8].includes(this.hex.toString(16).length);
        }

        toInt() {
            const instance = this.getInstance();
            if(instance.hexType == "string")
            return parseInt(instance.hex.replace("#", ""), 16);
            else return instance.hex;
        }
        toString() {
            const instance = this.getInstance();
            if(instance.hexType == "string")
            return instance.hex.startsWith("#") ? instance.hex : "#" + instance.hex;
            else return "#" + instance.hex.toString(16);
        }
        noSharp() {
            const instance = this.getInstance();
            return instance.toString().slice(1);
        }
    }
    static namedColor = class namedColor extends Color.ColorRoot {
        constructor(name) {
            if(!Color.names[name]) Color.err(`Unknown named color: ${name}`);
            super("named");
            this.name = name;
            this.hex = new Color.HEX(Color.names[name]);
        }
    }
    static nameSpaceColor = class nameSpaceColor extends Color.ColorRoot {
        constructor(type, alpha) {
            super(type);
            this.alpha = alpha;
            this.hasAlpha = alpha != null;
        }
    }
    static RGB = class RGB extends Color.nameSpaceColor {
        static fromStr = str => {
            const val = Color.getStrVal(str);

            return new Color.RGB(
                eval(val[0]),
                eval(val[1]),
                eval(val[2]),
                val.length == 4 ? Color.asPorc(val[3]) : null
            );
        }
        constructor(r, g, b, a) {
            super("rgb", a);
            this.r = r;
            this.g = g;
            this.b = b;
        }
    }
    static HSL = class HSL extends Color.nameSpaceColor {
        static fromStr = str => {
            const val = Color.getStrVal(str);
            
            return new Color.HSL(
                eval(val[0]),
                Color.asPorc(val[1]),
                Color.asPorc(val[2]),
                val.length == 4 ? Color.asPorc(val[3]) : null
            );
        }
        constructor(h, s, l, a) {
            super("hsl", a);
            this.h = ((h % 360) + 360) % 360;
            this.s = s;
            this.l = l;
        }
    }
    static HWB = class HWB extends Color.nameSpaceColor {
        static fromStr = str => {
            const val = Color.getStrVal(str);
            
            return new Color.HWB(
                eval(val[0]),
                Color.asPorc(val[1]),
                Color.asPorc(val[2]),
                val.length == 4 ? Color.asPorc(val[3]) : null
            );
        }
        constructor(h, w, b, a) {
            super("hwb", a);
            this.h = ((h % 360) + 360) % 360;
            this.w = w;
            this.b = b;
        }
    }
    static LAB = class LAB extends Color.nameSpaceColor {
        static fromStr = str => {
            const val = Color.getStrVal(str);
            
            return new Color.LAB(
                Color.asPorc(val[0]),
                eval(val[1]),
                eval(val[2]),
                val.length == 4 ? Color.asPorc(val[3]) : null
            );
        }
        constructor(l, a, b, alpha) {
            super("lab", alpha);
            this.l = l;
            this.a = a;
            this.b = b;
        }
    }
    static LCH = class LCH extends Color.nameSpaceColor {
        static fromStr = str => {
            const val = Color.getStrVal(str);
            
            return new Color.LCH(
                Color.asPorc(val[0]),
                eval(val[1]),
                eval(val[2]),
                val.length == 4 ? Color.asPorc(val[3]) : null
            );
        }
        constructor(l, c, h, a) {
            super("lch", a);
            this.l = l;
            this.c = c;
            this.h = h;
        }
    }
    static OKLAB = class OKLAB extends Color.nameSpaceColor {
        static fromStr = str => {
            const val = Color.getStrVal(str);
            
            return new Color.OKLAB(
                Color.asPorc(val[0]),
                eval(val[1]),
                eval(val[2]),
                val.length == 4 ? Color.asPorc(val[3]) : null
            );
        }
        constructor(l, a, b, alpha) {
            super("oklab", alpha);
            this.l = l;
            this.a = a;
            this.b = b;
        }
    }
    static OKLCH = class OKLCH extends Color.nameSpaceColor {
        static fromStr = str => {
            const val = Color.getStrVal(str);
            
            return new Color.OKLCH(
                Color.asPorc(val[0]),
                eval(val[1]),
                eval(val[2]),
                val.length == 4 ? Color.asPorc(val[3]) : null
            );
        }
        constructor(l, c, h, a) {
            super("oklch", a);
            this.l = l;
            this.c = c;
            this.h = h;
        }
    }
    static namedSpace = c => {
        const namedSpaces = [
            "rgb", "hsl", "hwb", "lab", "lch", "oklab", "oklch"
        ];

        c = c.trim().toLowerCase();
        const type = namedSpaces.find(n => c.startsWith(n));

        if(type) {
            if(c.includes("(") && c.includes(")")) {
                const value = c.substring(c.indexOf("(") + 1, c.indexOf(")"))

                return type == "rgb" ? Color.RGB.fromStr(value) :
                       type == "hsl" ? Color.HSL.fromStr(value) :
                       type == "hwb" ? Color.HWB.fromStr(value) :
                       type == "lab" ? Color.LAB.fromStr(value) :
                       type == "oklab" ? Color.OKLAB.fromStr(value) :
                       type == "oklch" ? Color.OKLCH.fromStr(value) : null;
            } else {
                Color.err(`named space color must contain "(" and ")", got: ${c}`);
            }
        } else {
            if(!c.includes(" ")) return new Color.HEX(c);
            let value = c;
            
            if(c.includes("(") && c.includes(")")) {
                value = c.substring(c.indexOf("(") + 1, c.indexOf(")"));
            }

            return Color.RGB.fromStr(value);
        }

        return null;
    }
        
    constructor(c, defaultOutput = Color.defaultOutputType) {
        let retColor;

        if(c?.instance instanceof Color.ColorRoot) {
            return c;
        } else if(typeof c == "string") {
            c = c.trim();

            if(c.startsWith("#")) {
                retColor = new Color.HEX(c);
            }
            else if (c in Color.names) retColor = new Color.namedColor(c);
            else {
                retColor = Color.namedSpace(c);
            }

        } else if(typeof c == "number") {
            retColor = new Color.HEX(c);

        } else if(Array.isArray(c)) {
            retColor = new Color.RGB(c[0], c[1], c[2], c[3]);
        } else if(window.THREE != null && c instanceof window.THREE.Color) {
            retColor = new Color.RGB(c.r, c.g, c.b);
        } else if(typeof c == "object" && c instanceof String) {
            if(c.ColorInstance) return c.ColorInstance;
            else retColor = new Color(c.toString());
        } else {
            Color.err(`Unexpected color type: ${typeof c}`, c);
        }

        if(!retColor) {
            Color.err(`Unexpected color output: ${c}`);
        }

        retColor.outputType = defaultOutput;


        return retColor;
    }
}