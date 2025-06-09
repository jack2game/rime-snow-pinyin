import { dump } from "js-yaml";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { homedir } from "os";

type Style = Record<string, any>;
type Collection = Record<string, Style>;

interface Config {
  dark: boolean;
  label: boolean;
}

interface KeyInfo {
  name: string;
  label?: string;
  up?: string;
  upLabel?: string;
  down?: string;
}

const keyInfos: KeyInfo[][] = [
  [
    { name: "q", down: "~" },
    { name: "p", down: "!" },
    { name: "k", down: "@" },
    { name: "r", down: "#" },
    { name: "y", down: "$" },
    { name: "t", down: "%" },
    { name: "c", down: "_" },
  ],
  [
    { name: "j", down: "|" },
    { name: "b", down: "^" },
    { name: "g", down: "&" },
    { name: "l", down: "*" },
    { name: "w", down: "(" },
    { name: "d", down: ")" },
    { name: "z", down: "+" },
  ],
  [
    { name: "x", down: "`" },
    { name: "lspace", up: "'", down: "1" },
    { name: "h", down: "2" },
    { name: "f", down: "3" },
    { name: "v", down: "4" },
    { name: "rspace", up: '"', down: "5" },
    { name: "s", down: "-" },
  ],
  [
    { name: "m", down: "\\" },
    { name: "o", down: "6" },
    { name: "a", down: "7" },
    { name: "i", down: "8" },
    { name: "e", down: "9" },
    { name: "u", down: "0" },
    { name: "n", down: "=" },
  ],
  [
    { name: "shift", label: "shift.fill", up: "#capsLocked", upLabel: "大写" },
    { name: "semicolon", label: ";", up: ":", down: "[" },
    { name: "comma", label: ",", up: "<", down: "{" },
    { name: "backspace", label: "delete.left", up: "#重输", upLabel: "清空" },
    { name: "period", label: ".", up: ">", down: "}" },
    { name: "slash", label: "/", up: "?", down: "]" },
    { name: "enter", label: "return", up: "#换行", upLabel: "换行" },
  ],
];

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
  for (const row of keyInfos) {
    for (const [keyIndex, key] of row.entries()) {
      const isMain = key.name.length === 1 || key.label?.length === 1;
      const isAlphabet = key.name.length === 1;
      let action: Action;
      if (isMain) {
        action = { character: key.label ?? key.name };
      } else {
        action =
          key.name === "lspace" || key.name === "rspace"
            ? "space"
            : (key.name as Action);
      }
      const foregroundStyle: string[] = [];
      const uppercasedStateForegroundStyle: string[] = [];
      const capsLockedStateForegroundStyle: string[] = [];
      if (action !== "space") {
        // label
        const labelName = key.name + "Label";
        foregroundStyle.push(labelName);
        if (isMain) {
          styles[labelName] = {
            ...structuredClone(mainLabel),
            text: key.label ?? key.name,
          };
        } else {
          styles[labelName] = {
            ...structuredClone(fnLabel),
            systemImageName: key.label ?? key.name,
          };
        }
      }
      let swipeUpAction: Action | undefined;
      let swipeDownAction: Action | undefined;
      if (key.up || isAlphabet) {
        const up = key.up ?? key.name.toUpperCase();
        const swipeUpName = key.name + "SwipeUp";
        if (!isAlphabet) foregroundStyle.push(swipeUpName);
        uppercasedStateForegroundStyle.push(swipeUpName);
        capsLockedStateForegroundStyle.push(swipeUpName);
        styles[swipeUpName] = {
          ...structuredClone(upSwipe),
          text: key.upLabel ?? up,
        };
        swipeUpAction =
          up.length === 1
            ? {
                character: up,
              }
            : {
                shortcutCommand: up,
              };
      }
      if (key.down) {
        const swipeDownName = key.name + "SwipeDown";
        foregroundStyle.push(swipeDownName);
        uppercasedStateForegroundStyle.push(swipeDownName);
        capsLockedStateForegroundStyle.push(swipeDownName);
        styles[swipeDownName] = {
          ...structuredClone(downSwipe),
          text: key.down,
        };
        swipeDownAction = {
          character: key.down ?? key.name.toLowerCase(),
        };
      }
      let backgroundStyle;
      if (isMain) {
        if (key.name.length === 1) {
          backgroundStyle = "aeiou".includes(key.name)
            ? `color${keyIndex}Alt`
            : `color${keyIndex}`;
        } else {
          backgroundStyle = "mainBackground";
        }
      } else {
        backgroundStyle = "fnBackground";
      }
      const c: Cell = {
        size: { width: "1/7" },
        backgroundStyle,
        foregroundStyle: config.label ? foregroundStyle : [],
        action,
        swipeUpAction,
        swipeDownAction,
      };
      if (key.name.length === 1) {
        const shiftName = key.name + "Shift";
        styles[shiftName] = {
          ...structuredClone(mainLabel),
          text: key.name.toUpperCase(),
        };
        const foreground = [...c.foregroundStyle];
        foreground[0] = shiftName;
        c.uppercasedStateForegroundStyle = config.label ? foreground : [];
        c.capsLockedStateForegroundStyle = config.label
          ? structuredClone(foreground)
          : [];
        c.uppercasedStateAction = {
          character: key.name.toUpperCase(),
        };
      }
      if (key.name === "shift") {
        c.preeditStateAction = { sendKeys: "Tab" };
        c.preeditStateForegroundStyle = "tab";
        styles["tab"] = {
          ...structuredClone(fnLabel),
          systemImageName: "arrow.right.to.line",
        };
      }
      styles[key.name] = c;
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
    secondaryButtonStyle: ["dismiss", "ascii", "script", "clipboard", "phrase"],
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
  const ascii: ToolbarButtonStyle = {
    backgroundStyle: "buttonBackground",
    foregroundStyle: `// JavaScript
    function getText() {
      return $getRimeOptionState("ascii_mode") ? "rimeImage" : "asciiImage";
    }`,
    action: { shortcutCommand: "#中英切换" },
  };
  const asciiImage: Image = {
    systemImageName: "character",
    ...imageBase,
  };
  const rimeImage: Image = {
    systemImageName: "characters.uppercase",
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
    ascii,
    asciiImage,
    rimeImage,
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
  const keyboardLayout: KeyboardLayout = keyInfos.map((row) => {
    const keys = row.map((key) => key.name);
    return {
      HStack: { subviews: keys.map((key) => ({ Cell: key })) },
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
  pinyinKeyboard: string
): HamsterSkinConfig {
  const pinyin: KeyboardConfig = {
    iPhone: {
      portrait: pinyinKeyboard,
      landscape: pinyinKeyboard,
    },
    iPad: {
      portrait: pinyinKeyboard,
      landscape: pinyinKeyboard,
      floating: pinyinKeyboard,
    },
  };
  return {
    name,
    author: "谭淞宸 <i@tansongchen.com>",
    pinyin,
    numeric: structuredClone(pinyin),
    symbolic: structuredClone(pinyin),
  };
}

function generateSkinFolder(
  path: string,
  skinName: string,
  keyboardName: string,
  label: boolean
): void {
  const prefix = join(
    homedir(),
    "Library/Mobile Documents/iCloud~dev~fuxiao~app~hamsterapp/Documents/Skins/"
  );
  const folder = join(prefix, path);
  mkdirSync(folder, { recursive: true });
  const skinConfig = makeHamsterSkinConfig(skinName, keyboardName);
  writeFileSync(join(folder, "config.yaml"), dump(skinConfig), "utf8");
  const build = (config: Config) => {
    const content = dump(makeHamsterSkin(config), { flowLevel: 2 });
    const modeFolder = join(folder, config.dark ? "dark" : "light");
    mkdirSync(modeFolder, { recursive: true });
    const fileName = join(modeFolder, `${keyboardName}.yaml`);
    writeFileSync(fileName, content, "utf8");
  };
  build({ dark: false, label });
  build({ dark: true, label });
}

generateSkinFolder("qpkr_rainbow", "俏皮可爱・七色", "qpkr_portrait", true);
generateSkinFolder(
  "qpkr_rainbow_nolabel",
  "俏皮可爱・七色・无刻",
  "qpkr_portrait",
  false
);
