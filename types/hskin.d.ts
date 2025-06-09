type HamsterSkinConfig = {
  name: string; // 皮肤名称
  author: string; // 作者名称
  fontface?: FontFace; // 字体名称
  pinyin: KeyboardConfig; // 拼音键盘配置
  alphabetic?: KeyboardConfig; // 字母键盘配置
  numeric: KeyboardConfig; // 数字键盘配置
  symbolic: KeyboardConfig; // 符号键盘配置
};

type FontFaceConfig = {
  url: string; // 字体文件的 URL
  name: string; // 字体名称
  ranges?: { location: number; length: number }[]; // 可选的字体范围
};

type KeyboardConfig = {
  iPhone: {
    portrait: string;
    landscape: string;
  };
  iPad: {
    portrait: string;
    landscape: string;
    floating: string;
  };
};

type Keyboard = {
  preeditHeight: number;
  preedit: Preedit;
  toolbarHeight: number;
  toolbar: Toolbar;
  keyboardHeight: number;
  keyboardStyle: KeyboardStyle;
  keyboardLayout: KeyboardLayout;
  [k: string]: any; // 其他样式或属性
};

// 预编辑区 Preedit

type Preedit = {
  insets: Insets;
  backgroundStyle: Ref<ImageBackgroundStyle>;
  foregroundStyle: Ref<PreeditForegroundStyle>;
};

type ImageBackgroundStyle = {
  normalImage: Image;
};

type PreeditForegroundStyle = {
  textColor: Color;
  fontSize: number;
  fontWeight: FontWeight;
};

// 工具栏区 Toolbar

type Toolbar = {
  backgroundStyle: Ref<ImageBackgroundStyle>;
  primaryButtonStyle: Ref<ToolbarButtonStyle>;
  secondaryButtonStyle: Ref<ToolbarButtonStyle>[];
  horizontalCandidateStyle: Ref<HorizontalCandidateStyle>;
  verticalCandidateStyle: Ref<VerticalCandidateStyle>;
  candidateContextMenu: Ref<CandidateContextMenu>;
};

type ToolbarButtonStyle = {
  backgroundStyle: Ref<ToolbarButtonBackgroundStyle>;
  foregroundStyle: Ref<ToolbarButtonForegroundStyle>;
  action: Action;
};

type ToolbarButtonBackgroundStyle = {
  normalColor: Color;
  highlightColor: Color;
};

type ToolbarButtonForegroundStyle =
  | { normalImage: Image; highlightImage: Image }
  | {
      text: string | ScriptExpression;
      normalColor: Color;
      highlightColor: Color;
      fontSize: FontSize;
      fontWeight: FontWeight;
    };

type HorizontalCandidateStyle = {
  insets: Insets;
  candidateStateButtonStyle?: Ref<CandidateStateButtonStyle>;
  highlightBackgroundColor?: string;
  preferredBackgroundColor?: string;
  preferredIndexColor?: string;
  preferredTextColor?: string;
  preferredCommentColor?: string;
  indexColor?: string;
  textColor?: string;
  commentColor?: string;
  indexFontSize?: number;
  indexFontWeight?: FontWeight;
  textFontSize?: number;
  textFontWeight?: FontWeight;
  commentFontSize?: number;
  commentFontWeight?: FontWeight;
  itemSpacing?: number;
};

type CandidateStateButtonStyle = {
  backgroundStyle: Ref<CandidateStateButtonBackgroundStyle>;
  foregroundStyle: Refs<CandidateStateButtonForegroundStyle>;
};

type CandidateStateButtonBackgroundStyle = {
  normalColor: string;
  highlightColor: string;
};

type CandidateStateButtonForegroundStyle = {
  normalImage: string;
  highlightImage: string;
};

type VerticalCandidateStyle = {
  insets?: Insets;
  bottomRowHeight?: number;
  backgroundStyle?: Ref<ImageBackgroundStyle>;
  candidateStyle?: Ref<CandidateStyle>;
  pageUpButtonStyle?: Ref<ButtonStyle>;
  pageDownButtonStyle?: Ref<ButtonStyle>;
  returnButtonStyle?: Ref<ButtonStyle>;
  backspaceButtonStyle?: Ref<ButtonStyle>;
};

type CandidateStyle = {
  insets?: Insets;
  backgroundColor?: Color;
  separatorColor?: Color;
  cornerRadius?: number;
  highlightBackgroundColor?: Color;
  preferredBackgroundColor?: Color;
  preferredIndexColor?: Color;
  preferredTextColor?: Color;
  preferredCommentColor?: Color;
  indexColor?: Color;
  textColor?: Color;
  commentColor?: Color;
  indexFontSize?: number;
  indexFontWeight?: FontWeight;
  textFontSize?: number;
  textFontWeight?: FontWeight;
  commentFontSize?: number;
  commentFontWeight?: FontWeight;
};

type ButtonStyle = {
  backgroundStyle: Ref<ToolbarButtonForegroundStyle>;
  foregroundStyle: Refs<ToolbarButtonForegroundStyle>;
};

type CandidateContextMenu = CandidateContextMenuItem[];

type CandidateContextMenuItem = {
  name: string;
  action: Action;
};

// 键盘 Keyboard

type KeyboardLayout = LayoutElement[];

type LayoutElement = CellReference | HStack | VStack;

type CellReference = {
  Cell: Ref<Cell>;
};

type HStack = {
  HStack: {
    subviews: LayoutElement[];
    style?: Ref<StackStyle>;
  };
};

type VStack = {
  VStack: {
    subviews: LayoutElement[];
    style?: Ref<StackStyle>;
  };
};

type StackStyle = {
  size: Size;
};

type Cell = {
  size?: Size;
  bounds?: Bounds;
  backgroundStyle?: Ref<CellBackgroundStyle>;
  foregroundStyle: Refs<CellForegroundStyle> | ScriptExpression;
  uppercasedStateForegroundStyle?: Refs<CellForegroundStyle> | ScriptExpression;
  capsLockedStateForegroundStyle?: Refs<CellForegroundStyle> | ScriptExpression;
  preeditStateForegroundStyle?: Refs<CellForegroundStyle> | ScriptExpression;

  hintStyle?: HintStyle;
  holdSymbolsStyle?: HoldSymbolsStyle;

  action?: Action;
  uppercasedStateAction?: Action;
  preeditStateAction?: Action;
  repeatAction?: Action;
  swipeUpAction?: Action;
  swipeDownAction?: Action;
  swipeLeftAction?: Action;
  swipeRightAction?: Action;

  type?: "symbols" | "pinyin" | "classifiedSymbols" | "subClassifiedSymbols";
  dataSource?: keyof DataSource;
  cellStyle?: Ref<CollectionCellStyle>;
};

type CellForegroundStyle = ForegroundTextStyle | ForegroundImageStyle;

type CellBackgroundStyle =
  | BackgroundImageStyle
  | BackgroundOriginalStyle;

type ForegroundImageStyle = {
  normalImage: Image;
  highlightImage?: Image;
};

type ForegroundTextStyle = {
  text: string | ScriptExpression;
  normalColor: string;
  highlightColor?: string;
  fontSize?: number;
  fontWeight?: FontWeight;
  center: Center;
};

type BackgroundImageStyle = {
  normalImage: Image;
  highlightImage?: Image;
  animation?: Ref<AnimationConfig>;
};

type BackgroundOriginalStyle = {
  type: "original";
  insets?: Insets;
  normalColor: string;
  highlightColor?: string;
  cornerRadius?: number;
  borderSize?: number;
  normalBorderColor?: string;
  highlightBorderColor?: string;
  normalLowerEdgeColor?: string;
  highlightLowerEdgeColor?: string;
  normalShadowColor?: string;
  highlightShadowColor?: string;
  shadowRadius?: number;
  shadowOffset?: Offset;
  animation?: Ref<AnimationConfig>;
};

type HintStyle = {
  insets?: Insets;
  backgroundStyle?: string;
  foregroundStyle?: string;
  swipeUpForegroundStyle?: string;
  swipeDownForegroundStyle?: string;
  swipeLeftForegroundStyle?: string;
  swipeRightForegroundStyle?: string;
};

type HoldSymbolsStyle = {
  insets?: Insets;
  backgroundStyle: string;
  foregroundStyle: string[];
  actions: Action[];
  selectedStyle?: string;
  selectedIndex?: number;
  symbolWidth?: number | string;
};

type CollectionCellStyle = {
  backgroundStyle: string;
  foregroundStyle: string;
};

/*** 行为 ***/

type Action =
  | PrimitiveAction
  | {
      character: string;
    }
  | {
      symbol: string;
    }
  | {
      shortcutCommand: string;
    }
  | {
      sendKeys?: string;
    }
  | {
      openURL?: string;
    }
  | {
      runScript?: string;
    }
  | {
      runTranslateScript?: string;
    }
  | {
      keyboardType?: "pinyin" | "alphabetic" | "numeric" | "symbolic" | string;
    }
  | {
      floatKeyboardType?: string;
    };

type PrimitiveAction =
  | "backspace"
  | "enter"
  | "shift"
  | "tab"
  | "space"
  | "dismissKeyboard"
  | "systemSettings"
  | "nextKeyboard"
  | "pageUp"
  | "pageDown"
  | "symbolicKeyboardLockStateToggle"
  | "returnPrimaryKeyboard";

/*** 动画 ***/

type AnimationConfig = BoundsAnimation | APNGAnimation | EmitAnimation;

type BoundsAnimation = {
  type: "bounds";
  duration: number;
  fromScale: number;
  toScale: number;
  repeatCount?: number;
};

type APNGAnimation = {
  type: "apng";
  file: string;
  targetScale?: number;
  useCellVisibleSize?: boolean;
  zPosition?: number | "above" | "below";
};

type EmitAnimation = {
  type: "emit";
  file: string[];
  duration: number;
  targetScale?: number;
  enableRandomImage?: boolean;
  randomPositionX?: number;
  randomPositionY?: number;
  rotationBegin?: number;
  rotationEnd?: number;
  randomRotation?: number;
  alphaBegin?: number;
  alphaEnd?: number;
};

// 通用定义

type Ref<_> = string;

type Refs<T> = Ref<T> | Ref<T>[];

type Color = string;

type FontSize = number | string;

type Image = ExternalImage | SFSymbol | InternalImage;

type TargetScale = number | { x: number; y: number };

type ExternalImage = {
  file: string;
  image: string;
  targetScale: TargetScale;
};

type SFSymbol = {
  systemImageName: string;
  normalColor: Color;
  highlightColor: Color;
  fontSize: number;
};

type InternalImage = {
  assetImageName: string;
  normalColor: Color;
  highlightColor: Color;
};

type Insets = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type Size = {
  width?: number | { percentage: number } | string;
  height?: number | { percentage: number } | string;
};

type Bounds = Size & {
  alignment?: "left" | "right" | "top" | "bottom";
};

type Offset = {
  x: number;
  y: number;
};

type Center = {
  x?: number;
  y?: number;
};

type FontWeight =
  | "ultralight"
  | "thin"
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "heavy"
  | "black";

type ScriptExpression = string; // 应以 "// JavaScript" 开头

/*** 图片描述文件 ***/

type ImageDescriptionFile = Record<
  string,
  {
    rect: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    insets: Insets;
  }
>;

/*** 数据源 ***/

type DataSourceValue = string | { label: string; value: string };
type DataSource = Record<string, DataSourceValue[]>;

/*** 样式定义 ***/

type KeyboardStyle = {
  backgroundStyle: Ref<CellBackgroundStyle>;
};
