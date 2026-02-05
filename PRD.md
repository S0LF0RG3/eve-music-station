# Eve Music Generation Station - PRD

A dual-mode agentic music generation application for creating Suno prompts and generating music with algorithmic mathematical precision.

**Experience Qualities:**
1. **Immersive** - Deep cosmic aesthetic pulls users into a creative flow state where mathematics meets music
2. **Powerful** - Sophisticated controls and real-time feedback make complex music generation feel effortless and precise
3. **Mysterious** - Dark, atmospheric design with mathematical symbols and golden ratio elements creates an otherworldly creative environment

**Complexity Level:** Complex Application (advanced functionality with multiple modes, real-time generation, algorithmic processing, and extensive state management)

## Essential Features

### Mode Selection
- **Functionality**: Toggle between Suno Export (lyrics/prompt generation) and ElevenLabs Generate (actual music creation and download)
- **Purpose**: Provides flexibility between budget-friendly prompt generation and instant AI music generation with audio playback
- **Trigger**: Mode selector at top of interface
- **Progression**: Select mode → Interface adapts to show mode-specific controls → Generation parameters update contextually → ElevenLabs shows API key input → Generate button behavior changes (export vs. generate music)
- **Success criteria**: Clear visual distinction between modes, appropriate controls shown/hidden, slider behavior adapts (informational vs functional), API key management for ElevenLabs

### Genre Selection
- **Functionality**: Multi-select genre tags from curated list including Trap, Hip-Hop, EDM, Industrial, Glitchcore, etc.
- **Purpose**: Defines the sonic foundation and informs algorithmic selection
- **Trigger**: Click genre tags to select/deselect (2-3 recommended)
- **Progression**: Browse genres → Select 2-3 → Genre pills highlight → Algorithm recommendations adjust → Style preview updates
- **Success criteria**: Visual feedback on selection, max 3-4 genres enforced gracefully, clear selected state

### Algorithmic Slider Controls
- **Functionality**: Four sliders (Weirdness 0-100, Style 0-100, Audio 0-100, Duration 30-300s) controlling generation parameters
- **Purpose**: Fine-tune the experimental nature, genre adherence, production quality, and length of output
- **Trigger**: Drag sliders or click track to set value
- **Progression**: Adjust slider → Real-time value display updates → Algorithm intensity scales → Preview description updates → Mathematical formulas adapt → Duration affects song structure and lyrics length
- **Success criteria**: Smooth dragging, numerical feedback, helpful descriptions at current values, different behavior in each mode, duration properly influences output structure

### Description Input
- **Functionality**: Text area for creative prompt describing desired sound, mood, energy, with enhance option in Suno mode
- **Purpose**: Captures user intent and influences lyric generation, algorithmic selection, and poetic essence
- **Trigger**: Focus text area and type, click enhance button to use AI to improve description
- **Progression**: Enter description → Character count updates → (Optional) Click enhance → Eve analyzes and rewrites description → Algorithms selected based on content → Perlin seed generated from text
- **Success criteria**: Comfortable typing experience, 500 char limit with counter, integrates with final output, enhance feature works smoothly

### Lyrics & Voice Input
- **Functionality**: Theme input, custom lyrics textarea, voice type selector (Male/Female/Instrumental), vocal style selector (19+ presets including growl, falsetto, death metal, operatic, rap, etc.), enhance option (Suno only), randomize option (Suno only)
- **Purpose**: Gives users control over lyrical content and vocal style/delivery, or lets AI generate creative lyrics. For Suno: formatted lyrics with meta-tags. For ElevenLabs: plain text lyrics (450 char max) sent to API. Vocal style presets guide the generation toward specific vocal delivery techniques.
- **Trigger**: Enter lyrics theme/concept or write full custom lyrics, select voice type, select vocal style preset, optionally enhance or randomize (Suno only)
- **Progression**: (Optional) Enter theme → Write lyrics or leave blank → Select voice type → Select vocal style (growl, falsetto, death metal, soft, powerful, raspy, operatic, etc.) → (Suno: Optional enhance/randomize with meta-tags) OR (ElevenLabs: Auto-generate concise lyrics ≤450 chars with style context) → Lyrics integrated into generation → (ElevenLabs: Lyrics and style sent to API, displayed in results)
- **Success criteria**: Intuitive layout, Suno mode has full meta-tag support with enhance/randomize, ElevenLabs mode enforces 450 char limit and generates plain text lyrics with vocal style context, voice selection clear, 19+ vocal style presets available (none, soft, powerful, raspy, breathy, operatic, rap, spoken-word, whispered, choir, harmonized, auto-tuned, growl, falsetto, death-metal, scream, guttural, melodic, aggressive), custom lyrics override auto-generation, lyrics displayed in results for both modes, vocal style influences generation prompt

### Music Generation
- **Functionality**: Primary action that orchestrates the entire generation process - creates Suno exports or actual playable music via ElevenLabs API, automatically saves to library
- **Purpose**: Transforms all user inputs and algorithmic calculations into usable music output with persistent storage
- **Trigger**: Click "Generate" button (disabled until at least 1 genre selected)
- **Progression**: Click Generate → Validate inputs → Call MusicGenerator → Process algorithms → (Suno: generate lyrics + style prompt) OR (ElevenLabs: create enhanced prompt → call ElevenLabs API → return audio blob) → Save to library → Display results → Enable playback/download/copy actions
- **Success criteria**: Clear loading states, handles errors gracefully, displays appropriate output format per mode, integrates all slider/genre/description inputs, saves successfully to library, provides library link

### Music Library
- **Functionality**: Persistent storage and display of all generated tracks with playback, download, and management capabilities
- **Purpose**: Preserve creative work, enable replay and sharing, provide history of generations
- **Trigger**: Auto-saves on successful generation, displays in library section below generator
- **Progression**: Generate track → Auto-save to library → Library refreshes → Browse tracks → Click track for details → Play/download/delete actions
- **Success criteria**: Tracks persist between sessions, displays all metadata, audio playback works, download function works, deletion works, library browses smoothly
- **Purpose**: Transforms all inputs into either Suno export files or actual downloadable music with audio player
- **Trigger**: Click "Generate Suno Export" or "Generate Music" button
- **Progression**: Click generate → Validate API key (ElevenLabs) → Loading state with algorithm visualization → LLM processes inputs → (If randomize enabled) Creative variations applied → Mathematical formulas calculated → (ElevenLabs) API call to generate audio → Output generated (Suno: lyrics/prompt, ElevenLabs: audio file) → Results displayed with copy/play/download options
- **Success criteria**: Clear loading states, error handling, generated content properly formatted, 808s always included, golden ratio signature present, randomization creates unique outputs, ElevenLabs generates actual playable audio with download functionality

### Results Display
- **Functionality**: Shows generated lyrics and style prompt (Suno) or audio player with playback controls, download, generated lyrics, and prompt (ElevenLabs)
- **Purpose**: Delivers the final output in immediately usable format with all relevant content
- **Trigger**: Successful generation completion
- **Progression**: Generation completes → Results fade in → Suno: formatted lyrics + style prompt with copy buttons → ElevenLabs: audio player with play/pause + waveform progress bar + download button + generated lyrics card (if vocals) + prompt display → Metadata shown
- **Success criteria**: Beautiful formatting, syntax highlighting for tags (Suno), one-click copy, audio player works reliably with play/pause controls, progress tracking, download generates proper timestamped filename, lyrics displayed for both modes when applicable

### Algorithm Visualization
- **Functionality**: Real-time display of active algorithms (Fibonacci, Golden Ratio, Perlin, etc.) and their parameters
- **Purpose**: Educates users about the mathematical foundation and adds mystique
- **Trigger**: Changes automatically based on genres, weirdness, and mode
- **Progression**: Input parameters change → Algorithm selection engine runs → Active algorithms display with formulas → Visual indicators show intensity → Tooltip details available
- **Success criteria**: Visually compelling mathematical notation, updates smoothly, doesn't overwhelm interface, educational tooltips

### Slider Analysis
- **Functionality**: "What would this sound like?" button that explains current slider configuration
- **Purpose**: Helps users understand the impact of their settings before generation
- **Trigger**: Click analysis button
- **Progression**: Click button → Modal/panel opens → LLM analyzes current config → Detailed description of expected output → Specific examples provided → Close to adjust
- **Success criteria**: Quick response, helpful descriptions, mode-aware analysis

### ElevenLabs API Integration
- **Functionality**: Secure API key storage, validation, and actual music generation using ElevenLabs Music Generation API with lyrics support
- **Purpose**: Enables real music creation with vocals/lyrics without leaving the app
- **Trigger**: Enter API key in ElevenLabs mode, validate, then generate
- **Progression**: Switch to ElevenLabs mode → Enter API key → Click validate → Success/error feedback → (Optional) Select voice type and enter lyrics → Generate music → API call with enhanced prompt and lyrics (if vocals selected) → Audio returned → Player displays with download option → Lyrics shown in results
- **Success criteria**: Secure key storage (browser-only), validation works, API calls succeed with lyrics parameter, audio plays correctly, lyrics displayed in results, proper error handling for API failures (including text length errors), 3s-5min duration support, 450 char lyrics limit enforced
- **Functionality**: "Recommend levels" button that auto-adjusts sliders based on genres and description
- **Purpose**: Helps beginners or speeds up workflow with intelligent defaults
- **Trigger**: Click recommend button
- **Progression**: Click → LLM analyzes genres + description → Slider values animate to recommended positions → User can fine-tune from there → Explanation of why these values
- **Success criteria**: Smooth animations, sensible recommendations, user maintains control, optional feature

### Shareable Links & Embedded Player (New)
- **Functionality**: Generate shareable links for individual tracks with dedicated player pages and embeddable iframe code
- **Purpose**: Allow users to share their generated music with others and embed tracks on external websites
- **Trigger**: Click share button on any track in the library
- **Progression**: Click share → Modal opens with direct link and embed code tabs → Copy link or embed code → Recipients access dedicated player page → Embedded version shows compact player → Full version shows complete track details and parameters
- **Success criteria**: Unique URLs for each track, embedded player loads correctly in iframes, copy-to-clipboard works, native share API integration on supported devices, player controls work independently, tracks persist in library for sharing

## Edge Case Handling

- **No genres selected**: Gentle prompt to select at least one genre, disable generate button with tooltip
- **Empty description**: Allow generation with generic description, show warning that results may be generic
- **Generation failure**: Clear error messages, suggest fixes (check connection, try again, adjust parameters), don't lose user input
- **Very long descriptions**: Character limit with counter, truncate gracefully if needed for API
- **Extreme slider combinations**: Allow but warn if configuration is unusual (all 0s, all 100s)
- **API timeouts**: Show retry option, explain ElevenLabs takes 30-40s normally, abort option available
- **Audio playback issues**: Fallback download link, format information, browser compatibility note
- **Missing API capabilities**: Graceful degradation if spark.llm unavailable, show static examples
- **Invalid API key**: Clear validation error, link to ElevenLabs settings page, secure storage of valid keys
- **ElevenLabs API errors**: Specific error messages for quota limits, invalid prompts, text length errors (450 char limit), network issues
- **Audio download**: Generate timestamped filename, proper MP3 format, handle blob URLs properly
- **Lyrics too long**: Automatically truncate to 450 chars for ElevenLabs with ellipsis, show warning to user
- **Instrumental with lyrics**: Hide lyrics input when instrumental selected, clear any entered lyrics

## Design Direction

The design should evoke the intersection of mathematics and music - where cosmic forces and algorithmic precision create sonic beauty. Think deep space observatory meets music production studio, with mathematical formulas floating like constellations. Dark, mysterious, powerful, with occasional bursts of golden/purple light. The interface should feel like controlling a sophisticated instrument rather than filling out a form.

## Color Selection

**Primary Color**: Deep Cosmic Purple `oklch(0.35 0.15 285)` - Represents creativity, mystique, and the musical realm
**Secondary Colors**: 
- Obsidian Black `oklch(0.15 0.02 285)` - Deep background that evokes infinite space
- Dark Matter `oklch(0.20 0.05 285)` - Elevated surfaces (cards, panels)
**Accent Color**: Golden Ratio Gold `oklch(0.75 0.12 85)` - φ (1.618) signature, used for CTAs, active states, mathematical highlights
**Supporting Colors**:
- Nebula Purple `oklch(0.55 0.20 295)` - Genre tags, hover states
- Void Blue `oklch(0.25 0.08 260)` - Inactive elements
- Cosmic White `oklch(0.95 0.02 285)` - Primary text

**Foreground/Background Pairings**:
- Background (Obsidian `oklch(0.15 0.02 285)`): Cosmic White text `oklch(0.95 0.02 285)` - Ratio 15.2:1 ✓
- Primary (Deep Cosmic Purple `oklch(0.35 0.15 285)`): Cosmic White text `oklch(0.95 0.02 285)` - Ratio 6.8:1 ✓
- Accent (Golden Ratio Gold `oklch(0.75 0.12 85)`): Obsidian text `oklch(0.15 0.02 285)` - Ratio 11.5:1 ✓
- Card (Dark Matter `oklch(0.20 0.05 285)`): Cosmic White text `oklch(0.95 0.02 285)` - Ratio 12.1:1 ✓
- Muted (Void Blue `oklch(0.25 0.08 260)`): Cosmic White text `oklch(0.95 0.02 285)` - Ratio 9.2:1 ✓

## Font Selection

Typography should balance technical precision with creative expressiveness - monospace for code/mathematical elements, elegant sans-serif for content.

**Primary Font**: Space Grotesk (Bold for headings, Medium for UI) - Geometric precision with slightly technical feel, perfect for the space/math aesthetic
**Secondary Font**: JetBrains Mono - Mathematical formulas, algorithm notation, code-like elements (tags, parameters)

**Typographic Hierarchy**:
- H1 (App Title): Space Grotesk Bold / 36px / -0.02em tracking / line-height 1.1
- H2 (Section Headers): Space Grotesk Bold / 24px / -0.01em tracking / line-height 1.2  
- H3 (Subsections): Space Grotesk Medium / 18px / normal tracking / line-height 1.3
- Body Text: Space Grotesk Regular / 15px / normal tracking / line-height 1.6
- Labels: Space Grotesk Medium / 13px / 0.01em tracking / line-height 1.4 / uppercase
- Code/Math: JetBrains Mono Regular / 14px / normal tracking / line-height 1.5
- Small Text: Space Grotesk Regular / 12px / 0.005em tracking / line-height 1.5

## Animations

Animations should feel like cosmic forces - smooth, physics-based, with occasional mysterious glitches that honor the glitchcore aesthetic. Use sparingly but purposefully.

- **Mode transitions**: Smooth fade with subtle scale (200ms) as interface reconfigures
- **Slider dragging**: Real-time thumb glow intensifies, trailing particles fade along track
- **Genre selection**: Satisfying "snap" into place with scale bounce (150ms spring)
- **Generate button**: Pulsing golden glow during generation, mathematical symbols orbiting
- **Results reveal**: Fade up with subtle y-translation (400ms ease-out), staggered children
- **Algorithm badges**: Fade in with scale on selection, gentle floating/rotation animation
- **Hover states**: Smooth color transitions (200ms), subtle lift on cards (2px y-translate)
- **Loading states**: Rotating golden ratio spiral, flowing particle systems
- **Error states**: Gentle shake animation (300ms) with red glow pulse
- **Success states**: Brief golden flash expanding from center (500ms)

## Component Selection

**Components**:
- **Tabs** (mode selector): Modified with custom styling for cosmic aesthetic, larger touch targets
- **Badge** (genres, algorithms): Custom purple variants with selection states, deletable when selected
- **Slider** (weirdness, style, audio): Heavily customized with gradient tracks, glowing thumbs, value tooltips
- **Textarea** (description): Custom dark variant with character counter, focus glow effect
- **Button** (generate, analyze, recommend): Primary uses accent gold, secondary uses purple, loading states
- **Card** (results, sections): Dark matter background with subtle border glow, elevated shadows
- **ScrollArea** (genre list, results): Custom purple scrollbar, smooth scrolling
- **Dialog** (analysis modal): Frosted glass effect with cosmic background blur
- **Tooltip** (algorithm info, controls): Dark with purple accent, instant show
- **Sonner** (toasts): Custom dark theme with purple accents for notifications

**Customizations**:
- Custom slider with gradient track showing intensity (purple to gold based on value)
- Genre badge component with multi-select state management
- Algorithm visualization cards with mathematical notation rendering
- Audio player with custom controls (cosmic theme)
- Copy button with success animation and feedback
- Mode toggle with smooth transition animation

**States**:
- **Buttons**: Default (purple glow), hover (golden glow intensifies), active (pressed scale), disabled (dim with opacity), loading (spinning golden ratio)
- **Sliders**: Default (purple track), hover (glow), dragging (intense glow + particles), disabled (desaturated)
- **Genres**: Unselected (void blue), hover (nebula purple glow), selected (cosmic purple + golden border), disabled (gray)
- **Inputs**: Default (dark border), focus (golden glow ring), error (red glow), success (green subtle glow)

**Icon Selection**:
- MusicNotes (phosphor) - Main app icon, generation
- Sliders (phosphor) - Controls section
- Sparkle (phosphor) - Algorithm effects, magic features
- Lightning (phosphor) - Generate action
- Copy (phosphor) - Copy to clipboard
- Download (phosphor) - Download audio
- Play/Pause (phosphor) - Audio playback
- Info (phosphor) - Tooltips, help
- ArrowsClockwise (phosphor) - Recommend/refresh
- X (phosphor) - Close, deselect
- Check (phosphor) - Success states
- Key (phosphor) - API key management
- Eye/EyeSlash (phosphor) - Show/hide API key
- CheckCircle (phosphor) - Valid API key
- Warning (phosphor) - Invalid API key

**Spacing**:
- Section gaps: 8 (32px)
- Card padding: 6 (24px)
- Form element gaps: 4 (16px)  
- Inline element gaps: 2 (8px)
- Tight groups: 1 (4px)
- Page margins: 8 on desktop, 4 on mobile

**Mobile**:
- Single column layout throughout
- Larger touch targets (min 48px) for sliders and buttons
- Genre pills wrap naturally in grid
- Sticky mode selector at top
- Fixed generate button at bottom (always accessible)
- Collapsible algorithm section on mobile
- Full-width cards with reduced padding (4)
- Stack all controls vertically
- Results take full width with comfortable padding
