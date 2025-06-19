import { dump } from "js-yaml";
import { mkdirSync, writeFileSync } from "fs";
import { join, parse } from "path";
import { homedir } from "os";

type Style = Record<string, any>;
type Collection = Record<string, Style>;

interface Config {
  colorful: boolean;
  dark: boolean;
  label: boolean;
  keyInfos: KeyInfo[][];
}

interface KeyInfo {
  action: string;
  name?: string;
  label?: string;
  up?: string;
  upLabel?: string;
  down?: string;
  downLabel?: string;
  preedit?: string;
  preeditLabel?: string;
  width?: string;
}

const qpkr: KeyInfo[][] = [
  [
    { action: "q", down: "~" },
    { action: "p", down: "!" },
    { action: "k", down: "@" },
    { action: "r", down: "#" },
    { action: "y", down: "$" },
    { action: "t", down: "%" },
    { action: "c", down: "_" },
  ],
  [
    { action: "j", down: "|" },
    { action: "b", down: "^" },
    { action: "g", down: "&" },
    { action: "l", down: "*" },
    { action: "w", down: "(" },
    { action: "d", down: ")" },
    { action: "z", down: "+" },
  ],
  [
    { action: "x", down: "`" },
    { action: "space", name: "lspace", up: "'", down: "1" },
    { action: "h", down: "2" },
    { action: "f", down: "3" },
    { action: "v", down: "4" },
    { action: "space", name: "rspace", up: '"', down: "5" },
    { action: "s", down: "-" },
  ],
  [
    { action: "m", down: "\\" },
    { action: "o", down: "6" },
    { action: "a", down: "7" },
    { action: "i", down: "8" },
    { action: "e", down: "9" },
    { action: "u", down: "0" },
    { action: "n", down: "=" },
  ],
  [
    {
      action: "#中英切换",
      name: "ascii_mode",
      label: "globe",
      up: "shift",
      upLabel: "上档",
      preedit: "*Page_Down",
      preeditLabel: "arrow.right.to.line",
    },
    { action: ";", name: "semicolon", up: ":", down: "[" },
    { action: ",", name: "comma", up: "<", down: "{" },
    { action: "backspace", label: "delete.left", up: "#重输", upLabel: "清空" },
    { action: ".", name: "period", up: ">", down: "}" },
    { action: "/", name: "slash", up: "?", down: "]" },
    { action: "enter", label: "return", up: "#换行", upLabel: "换行" },
  ],
];

const qwerty: KeyInfo[][] = [
  [
    { action: "1", name: "k1", up: "!", down: "!" },
    { action: "2", name: "k2", up: "@", down: "@" },
    { action: "3", name: "k3", up: "#", down: "#" },
    { action: "4", name: "k4", up: "$", down: "$" },
    { action: "5", name: "k5", up: "%", down: "%" },
    { action: "6", name: "k6", up: "^", down: "^" },
    { action: "7", name: "k7", up: "&", down: "&" },
    { action: "8", name: "k8", up: "*", down: "*" },
    { action: "9", name: "k9", up: "(", down: "(" },
    { action: "0", name: "k0", up: ")", down: ")" },
  ],
  [
    { action: "q", down: "_" },
    { action: "w", down: "-" },
    { action: "e", down: "+" },
    { action: "r", down: "=" },
    { action: "t", down: "|" },
    { action: "y", down: "\\" },
    { action: "u", down: "[" },
    { action: "i", down: "]" },
    { action: "o", down: "{" },
    { action: "p", down: "}" },
  ],
  [
    { action: "a", down: "~" },
    { action: "s", down: "`" },
    { action: "d", down: '"' },
    { action: "f", down: "'" },
    { action: "g", down: "#方案切换", downLabel: "方案" },
    { action: "h", down: "*Left", downLabel: "←" },
    { action: "j", down: "*Down", downLabel: "↓" },
    { action: "k", down: "*Up", downLabel: "↑" },
    { action: "l", down: "*Right", downLabel: "→" },
    { action: ";", name: "semicolon", up: ":" },
  ],
  [
    { action: "z", down: "#撤销", downLabel: "撤销" },
    { action: "x", down: "#剪切", downLabel: "剪切" },
    { action: "c", down: "#复制", downLabel: "复制" },
    { action: "v", down: "#粘贴", downLabel: "粘贴" },
    { action: "b", down: "#重做", downLabel: "重做" },
    { action: "n", down: "*Home", downLabel: "行首" },
    { action: "m", down: "*End", downLabel: "行尾" },
    { action: ",", name: "comma", up: "<" },
    { action: ".", name: "period", up: ">" },
    { action: "/", name: "slash", up: "?" },
  ],
  [
    {
      action: "shift",
      label: "shift.fill",
      up: "#capsLocked",
      upLabel: "大写",
      preedit: "*Page_Down",
      preeditLabel: "arrow.right.to.line",
      width: "15/100",
    },
    {
      action: "#中英切换",
      name: "ascii_mode",
      label: "globe",
      up: "#简繁切换",
      upLabel: "简繁",
      preedit: "*Page_Up",
      preeditLabel: "arrow.left.to.line",
      width: "15/100",
    },
    {
      action: "space",
      label: "space",
      up: "#RimeSwitcher",
      upLabel: "选单",
      width: "40/100",
    },
    {
      action: "backspace",
      label: "delete.left",
      up: "#重输",
      upLabel: "清空",
      width: "15/100",
    },
    {
      action: "enter",
      label: "return",
      up: "#换行",
      upLabel: "换行",
      width: "15/100",
    },
  ],
];

function parseAction(raw: string): Action {
  if (raw.length === 1) {
    return { character: raw };
  } else if (raw.startsWith("#")) {
    return { shortcutCommand: raw };
  } else if (raw.startsWith("*")) {
    return { sendKeys: raw.slice(1) };
  } else {
    return raw as Action;
  }
}

function makeKeyboardLayoutStyles(config: Config): Collection {
  const baseColor = config.dark ? "707070" : "f7f7f7";
  const altColor = config.dark ? "4c4c4c" : "e7e7e7";
  const mainBackground: CellBackgroundStyle = {
    type: "original",
    insets: { left: 2, right: 2, top: 2, bottom: 2 },
    normalColor: baseColor,
    highlightColor: altColor,
    cornerRadius: 2,
  };
  const fnBackground: CellBackgroundStyle = {
    ...mainBackground,
    normalColor: altColor,
    highlightColor: baseColor,
  };
  const styles: Collection = { mainBackground, fnBackground };
  const mainColor = config.dark ? "ffffff" : "000000";
  const mainLabel: Omit<CellForegroundStyle, "text"> = {
    normalColor: mainColor,
    highlightColor: mainColor,
    fontSize: 20,
    fontWeight: "regular",
    center: { y: 0.75 },
  };
  const fnLabel: Omit<CellForegroundStyle, "text"> = {
    ...mainLabel,
    fontSize: 16,
    center: { y: 0.6 },
  };
  const swipeColor = config.dark ? "e5e5e5" : "575757";
  const upSwipe: Omit<CellForegroundStyle, "text"> = {
    normalColor: swipeColor,
    highlightColor: swipeColor,
    fontSize: 10,
    fontWeight: "regular",
    center: { y: 0.6 },
  };
  const downSwipe: Omit<CellForegroundStyle, "text"> = {
    ...upSwipe,
    center: { y: 1.2 },
  };
  const rainbow = [
    { dark: "#893E3E", dark2: "#AC5353", light: "#ECB6B6", light2: "#DA7171" },
    { dark: "#7A5329", dark2: "#AE753A", light: "#F3D9C9", light2: "#E8B696" },
    { dark: "#636321", dark2: "#959537", light: "#F5F0C2", light2: "#F4E98B" },
    { dark: "#3E6F49", dark2: "#5E9A6B", light: "#BCE6C5", light2: "#8FD69F" },
    { dark: "#366872", dark2: "#4C8F9D", light: "#B2E6F0", light2: "#8ADAEA" },
    { dark: "#205C83", dark2: "#418CBE", light: "#A5D4F3", light2: "#81C3EF" },
    { dark: "#605388", dark2: "#8174AA", light: "#C7BAF2", light2: "#B3A1ED" },
  ];
  for (const [index, color] of rainbow.entries()) {
    const baseColor = config.dark ? color.dark : color.light;
    const altColor = config.dark ? color.dark2 : color.light2;
    const backgroundStyle: CellBackgroundStyle = {
      ...structuredClone(mainBackground),
      normalColor: baseColor,
      highlightColor: altColor,
    };
    styles[`color${index}`] = backgroundStyle;
    const altBackgroundStyle: CellBackgroundStyle = {
      ...structuredClone(mainBackground),
      normalColor: altColor,
      highlightColor: baseColor,
    };
    styles[`color${index}Alt`] = altBackgroundStyle;
  }
  for (const row of config.keyInfos) {
    for (const [keyIndex, key] of row.entries()) {
      const isCharacter = key.action.length === 1;
      const isAlphabet = /^[a-zA-Z]$/.test(key.action);
      let name = key.name ?? key.action;
      const action = parseAction(key.action);
      const foregroundStyle: string[] = [];
      const uppercasedStateForegroundStyle: string[] = [];
      const capsLockedStateForegroundStyle: string[] = [];
      if (action !== "space") {
        // label
        const labelName = name + "Label";
        foregroundStyle.push(labelName);
        if (isCharacter) {
          styles[labelName] = {
            ...structuredClone(mainLabel),
            text: key.label ?? key.action,
          };
        } else {
          styles[labelName] = {
            ...structuredClone(fnLabel),
            systemImageName: key.label ?? key.action,
          };
        }
      }
      let swipeUpAction: Action | undefined;
      let swipeDownAction: Action | undefined;
      if (key.up || isAlphabet) {
        const up = key.up ?? key.action.toUpperCase();
        const swipeUpName = name + "SwipeUp";
        if (!isAlphabet) foregroundStyle.push(swipeUpName);
        uppercasedStateForegroundStyle.push(swipeUpName);
        capsLockedStateForegroundStyle.push(swipeUpName);
        styles[swipeUpName] = {
          ...structuredClone(upSwipe),
          text: key.upLabel ?? up,
        };
        swipeUpAction = parseAction(up);
      }
      if (key.down) {
        const swipeDownName = name + "SwipeDown";
        foregroundStyle.push(swipeDownName);
        uppercasedStateForegroundStyle.push(swipeDownName);
        capsLockedStateForegroundStyle.push(swipeDownName);
        styles[swipeDownName] = {
          ...structuredClone(downSwipe),
          text: key.downLabel ?? key.down,
        };
        swipeDownAction = parseAction(key.down);
      }
      let backgroundStyle;
      if (isCharacter) {
        if (isAlphabet && config.colorful) {
          backgroundStyle = "aeiou".includes(key.action)
            ? `color${keyIndex}Alt`
            : `color${keyIndex}`;
        } else {
          backgroundStyle = "mainBackground";
        }
      } else {
        backgroundStyle = "fnBackground";
      }
      const c: Cell = {
        size: { width: key.width ?? `1/${row.length}` },
        backgroundStyle,
        foregroundStyle: config.label ? foregroundStyle : [],
        action,
        swipeUpAction,
        swipeDownAction,
      };
      if (isAlphabet) {
        const shiftName = name + "Shift";
        styles[shiftName] = {
          ...structuredClone(mainLabel),
          text: key.action.toUpperCase(),
        };
        const foreground = [...c.foregroundStyle];
        foreground[0] = shiftName;
        c.uppercasedStateForegroundStyle = config.label ? foreground : [];
        c.capsLockedStateForegroundStyle = config.label
          ? structuredClone(foreground)
          : [];
        c.uppercasedStateAction = {
          character: key.action.toUpperCase(),
        };
      }
      if (key.preedit) {
        const preeditName = name + "Preedit";
        c.preeditStateAction = parseAction(key.preedit);
        c.preeditStateForegroundStyle = preeditName;
        styles[preeditName] = {
          ...structuredClone(fnLabel),
          systemImageName: key.preeditLabel ?? key.preedit,
        };
      }
      styles[name] = c;
    }
  }
  return styles;
}

function makeGeneralStyles(config: Config): Collection {
  const background: BackgroundOriginalStyle = {
    type: "original",
    normalColor: config.dark ? "2C2C2C03" : "D1D1D1FC",
  };
  return { background };
}

function makePreedit(config: Config): [Preedit, Collection] {
  const preedit = {
    insets: { left: 1, right: 1, top: 1, bottom: 1 },
    backgroundStyle: "background",
    foregroundStyle: "preeditForeground",
  };
  const textColor = config.dark ? "ffffff" : "000000";
  const preeditForeground: PreeditForegroundStyle = {
    textColor,
    fontSize: 16,
    fontWeight: "regular",
  };
  return [preedit, { preeditForeground }];
}

function makeToolbar(config: Config): [Toolbar, Collection] {
  const buttonColor = config.dark ? "E5E5E5" : "575757";
  const toolbar: Toolbar = {
    backgroundStyle: "backgroundOriginalStyle",
    primaryButtonStyle: "hamster",
    secondaryButtonStyle: [
      "dismiss",
      "alphabetic",
      "pinyin",
      "script",
      "clipboard",
      "phrase",
    ],
    horizontalCandidateStyle: "horizontalCandidate",
    verticalCandidateStyle: "verticalCandidate",
    candidateContextMenu: "candidateContextMenu",
  };
  const imageBase = {
    normalColor: buttonColor,
    highlightColor: buttonColor,
    fontSize: 16,
  };
  const hamster: ToolbarButtonStyle = {
    backgroundStyle: "buttonBackground",
    foregroundStyle: "hamsterImage",
    action: { openURL: "hamster://" },
  };
  const hamsterImage: Image = {
    systemImageName: "r.circle",
    ...imageBase,
  };
  const dismiss: ToolbarButtonStyle = {
    backgroundStyle: "buttonBackground",
    foregroundStyle: "dismissImage",
    action: "dismissKeyboard",
  };
  const dismissImage: Image = {
    systemImageName: "chevron.down.circle",
    ...imageBase,
  };
  const alphabetic: ToolbarButtonStyle = {
    backgroundStyle: "buttonBackground",
    foregroundStyle: "alphabeticImage",
    action: { keyboardType: "alphabetic" },
  };
  const alphabeticImage: Image = {
    systemImageName: "characters.uppercase",
    ...imageBase,
  };
  const pinyin: ToolbarButtonStyle = {
    backgroundStyle: "buttonBackground",
    foregroundStyle: "pinyinImage",
    action: { keyboardType: "pinyin" },
  };
  const pinyinImage: Image = {
    systemImageName: "character",
    ...imageBase,
  };
  const script: ToolbarButtonStyle = {
    backgroundStyle: "buttonBackground",
    foregroundStyle: "scriptImage",
    action: { shortcutCommand: "#toggleScriptView" },
  };
  const scriptImage: Image = {
    systemImageName: "function",
    ...imageBase,
  };
  const clipboard: ToolbarButtonStyle = {
    backgroundStyle: "buttonBackground",
    foregroundStyle: "clipboardImage",
    action: { shortcutCommand: "#showPasteboardView" },
  };
  const clipboardImage: Image = {
    systemImageName: "doc.on.clipboard",
    ...imageBase,
  };
  const phrase: ToolbarButtonStyle = {
    backgroundStyle: "buttonBackground",
    foregroundStyle: "phraseImage",
    action: { shortcutCommand: "#showPhraseView" },
  };
  const phraseImage: Image = {
    systemImageName: "text.quote",
    ...imageBase,
  };
  const backgroundColor = config.dark ? "000000" : "ffffff";
  const textColor = config.dark ? "ffffff" : "000000";
  const horizontalCandidate: HorizontalCandidateStyle = {
    insets: { left: 1, bottom: 1, top: 1 },
    candidateStateButtonStyle: "expand",
    highlightBackgroundColor: backgroundColor,
    preferredBackgroundColor: backgroundColor,
    preferredIndexColor: textColor,
    preferredTextColor: textColor,
    preferredCommentColor: textColor,
    indexColor: textColor,
    textColor: textColor,
    commentColor: textColor,
    indexFontSize: 18,
    textFontSize: 18,
    commentFontSize: 18,
  };
  const verticalCandidate = {
    insets: { top: 1, bottom: 1, left: 1, right: 1 },
    bottomRowHeight: 50,
  };
  const expand: CandidateStateButtonStyle = {
    backgroundStyle: "buttonBackground",
    foregroundStyle: "expandImage",
  };
  const expandImage: Image = {
    systemImageName: "chevron.down",
    ...imageBase,
  };
  const styles = {
    hamster,
    hamsterImage,
    dismiss,
    dismissImage,
    alphabetic,
    alphabeticImage,
    pinyin,
    pinyinImage,
    script,
    scriptImage,
    clipboard,
    clipboardImage,
    phrase,
    phraseImage,
    expand,
    expandImage,
    horizontalCandidate,
    verticalCandidate,
  };
  return [toolbar, styles];
}

function makeKeyboardLayout(
  config: Config
): [KeyboardLayout, KeyboardStyle, Collection] {
  const styles: Collection = makeKeyboardLayoutStyles(config);
  const keyboardStyle: KeyboardStyle = {
    backgroundStyle: "backgroundOriginalStyle",
  };
  const keyboardLayout: KeyboardLayout = config.keyInfos.map((row) => {
    return {
      HStack: { subviews: row.map((x) => ({ Cell: x.name ?? x.action })) },
    };
  });
  return [keyboardLayout, keyboardStyle, styles];
}

function makeHamsterSkin(config: Config): Keyboard {
  const styles = makeGeneralStyles(config);
  const [preedit, styles1] = makePreedit(config);
  const [toolbar, styles2] = makeToolbar(config);
  const [keyboardLayout, keyboardStyle, styles3] = makeKeyboardLayout(config);
  return {
    preeditHeight: 25,
    toolbarHeight: 45,
    keyboardHeight: 250,
    preedit,
    toolbar,
    keyboardLayout,
    keyboardStyle,
    ...styles,
    ...styles1,
    ...styles2,
    ...styles3,
  };
}

function makeHamsterSkinConfig(
  name: string,
  keyboards: KeyboardCollection
): HamsterSkinConfig {
  const make = (name: string): KeyboardConfig => ({
    iPhone: {
      portrait: name,
      landscape: name,
    },
    iPad: {
      portrait: name,
      landscape: name,
      floating: name,
    },
  });
  return {
    name,
    author: "谭淞宸 <i@tansongchen.com>",
    pinyin: make("pinyin"),
    alphabetic: keyboards.alphabetic ? make("alphabetic") : undefined,
    numeric: keyboards.numeric ? make("numeric") : make("pinyin"),
    symbolic: keyboards.symbolic ? make("symbolic") : make("pinyin"),
  };
}

type KeyboardType = "pinyin" | "alphabetic" | "numeric" | "symbolic";
type KeyboardCollection = Partial<Record<KeyboardType, Omit<Config, "dark">>>;

function generateSkinFolder(name: string, keyboards: KeyboardCollection) {
  const prefix = join(
    homedir(),
    "Library/Mobile Documents/iCloud~dev~fuxiao~app~hamsterapp/Documents/Skins/"
  );
  const folder = join(prefix, name);
  mkdirSync(folder, { recursive: true });
  const skinConfig = makeHamsterSkinConfig(name, keyboards);
  writeFileSync(join(folder, "config.yaml"), dump(skinConfig), "utf8");
  for (const dark of [false, true]) {
    const modeFolder = join(folder, dark ? "dark" : "light");
    mkdirSync(modeFolder, { recursive: true });
    for (const [key, config] of Object.entries(keyboards)) {
      const content = dump(makeHamsterSkin({ ...config, dark }), {
        flowLevel: 2,
      });
      const fileName = join(modeFolder, `${key}.yaml`);
      writeFileSync(fileName, content, "utf8");
    }
  }
}

const c1 = {
  colorful: true,
  label: true,
  keyInfos: qpkr,
};
const c11 = {
  colorful: true,
  label: false,
  keyInfos: qpkr,
};
const c2 = {
  colorful: false,
  label: true,
  keyInfos: qwerty,
};

generateSkinFolder("俏皮可爱・七色", { pinyin: c1, alphabetic: c2 });
generateSkinFolder("俏皮可爱・七色・无刻", { pinyin: c11, alphabetic: c2 });
generateSkinFolder("直列 45 键", { pinyin: c2 });
