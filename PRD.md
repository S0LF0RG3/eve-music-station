# Eve Music Generation Station - PRD

A dual-mode agentic music generation application for creating Suno prompts and generating music with algorithmic mathematical precision.

**Experience Qualities:**
1. **Immersive** - Deep cosmic aesthetic pulls users into a creative flow state where mathematics meets music
2. **Powerful** - Sophisticated controls and real-time feedback make complex music generation feel effortless and precise
3. **Mysterious** - Dark, atmospheric design with mathematical symbols and golden ratio elements creates an otherworldly creative environment

**Complexity Level:** Complex Application (advanced functionality with multiple modes, real-time generation, algorithmic processing, and extensive state management)

## Essential Features

### Mode Selection
- **Functionality**: Toggle between Suno Export (lyrics/prompt generation) and ElevenLabs Generate (actual music creation)
- **Purpose**: Provides flexibility between budget-friendly prompt generation and premium instant music generation
- **Trigger**: Mode selector at top of interface
- **Progression**: Select mode → Interface adapts to show mode-specific controls → Generation parameters update contextually → Generate button behavior changes
- **Success criteria**: Clear visual distinction between modes, appropriate controls shown/hidden, slider behavior adapts (informational vs functional)

### Genre Selection
- **Functionality**: Multi-select genre tags from curated list including Trap, Hip-Hop, EDM, Industrial, Glitchcore, etc.
- **Purpose**: Defines the sonic foundation and informs algorithmic selection
- **Trigger**: Click genre tags to select/deselect (2-3 recommended)
- **Progression**: Browse genres → Select 2-3 → Genre pills highlight → Algorithm recommendations adjust → Style preview updates
- **Success criteria**: Visual feedback on selection, max 3-4 genres enforced gracefully, clear selected state

### Algorithmic Slider Controls
- **Functionality**: Three sliders (Weirdness 0-100, Style 0-100, Audio 0-100) controlling generation parameters
- **Purpose**: Fine-tune the experimental nature, genre adherence, and production quality of output
- **Trigger**: Drag sliders or click track to set value
- **Progression**: Adjust slider → Real-time value display updates → Algorithm intensity scales → Preview description updates → Mathematical formulas adapt
- **Success criteria**: Smooth dragging, numerical feedback, helpful descriptions at current values, different behavior in each mode

### Description Input
- **Functionality**: Text area for creative prompt describing desired sound, mood, energy
- **Purpose**: Captures user intent and influences lyric generation, algorithmic selection, and poetic essence
- **Trigger**: Focus text area and type
- **Progression**: Enter description → Character count updates → Eve analyzes intent (optional) → Algorithms selected based on content → Perlin seed generated from text
- **Success criteria**: Comfortable typing experience, 500 char limit with counter, integrates with final output

### Music Generation
- **Functionality**: Primary action that orchestrates the entire generation process
- **Purpose**: Transforms all inputs into either Suno export files or actual music playback
- **Trigger**: Click "Generate Suno Export" or "Generate Music" button
- **Progression**: Click generate → Loading state with algorithm visualization → LLM processes inputs → Mathematical formulas calculated → Output generated → Results displayed with copy/download options
- **Success criteria**: Clear loading states, error handling, generated content properly formatted, 808s always included, golden ratio signature present

### Results Display
- **Functionality**: Shows generated lyrics, style prompt (Suno) or audio player with download (ElevenLabs)
- **Purpose**: Delivers the final output in usable format
- **Trigger**: Successful generation completion
- **Progression**: Generation completes → Results fade in → Suno: formatted lyrics + style prompt with copy buttons → ElevenLabs: audio player + download + prompt display → Metadata shown
- **Success criteria**: Beautiful formatting, syntax highlighting for tags, one-click copy, audio player works reliably, download generates proper filename

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

### Recommended Settings
- **Functionality**: "Recommend levels" button that auto-adjusts sliders based on genres and description
- **Purpose**: Helps beginners or speeds up workflow with intelligent defaults
- **Trigger**: Click recommend button
- **Progression**: Click → LLM analyzes genres + description → Slider values animate to recommended positions → User can fine-tune from there → Explanation of why these values
- **Success criteria**: Smooth animations, sensible recommendations, user maintains control, optional feature

## Edge Case Handling

- **No genres selected**: Gentle prompt to select at least one genre, disable generate button with tooltip
- **Empty description**: Allow generation with generic description, show warning that results may be generic
- **Generation failure**: Clear error messages, suggest fixes (check connection, try again, adjust parameters), don't lose user input
- **Very long descriptions**: Character limit with counter, truncate gracefully if needed for API
- **Extreme slider combinations**: Allow but warn if configuration is unusual (all 0s, all 100s)
- **API timeouts**: Show retry option, explain ElevenLabs takes 30-40s normally, abort option available
- **Audio playback issues**: Fallback download link, format information, browser compatibility note
- **Missing API capabilities**: Graceful degradation if spark.llm unavailable, show static examples

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
