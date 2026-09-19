Paste this directly into **Figma Make AI**:

> Completely replace the existing **“How I approach design” / My Process** section with a brand-new **scroll-driven stacked-card concept inspired by the card-stacking interaction used in the Designor live website**.
>
> Do **not** preserve the previous zig-zag timeline, alternating cards, curved path, or central process line. Rebuild this section from scratch using a premium editorial card-stack interaction.
>
> Keep the rest of my portfolio unchanged.
>
> ## Core concept
>
> The section should present my 7-step design process as a sequence of **large full-width cards that stack on top of each other as the user scrolls**.
>
> Process:
>
> **01 Understand → 02 Research → 03 Define → 04 Explore → 05 Design → 06 Prototype → 07 Iterate**
>
> The experience should feel like the visitor is moving through a deck of design-process cards.
>
> As each new step reaches the viewport, it should slide upward and partially cover the previous card.
>
> Previous cards remain visible behind the active card as layered edges, creating a clear visual stack.
>
> Do not turn this into a normal vertical list.
>
> ---
>
> ## Section introduction
>
> Before the card stack begins, create a spacious editorial introduction.
>
> Small eyebrow:
>
> **03 / MY PROCESS**
>
> Main heading:
>
> **How I approach design.**
>
> Highlight only the word **“design.”** using a subtle purple/lavender accent.
>
> Supporting text:
>
> **A structured, human-centered process that turns complex problems into simple, meaningful experiences.**
>
> Keep the introduction minimal with generous white space.
>
> Add a subtle line underneath:
>
> **People → Insights → Ideas → Experiences → Impact**
>
> ---
>
> # CARD STACK INTERACTION
>
> This is the most important part.
>
> Create a tall scroll section where the cards use **sticky positioning**.
>
> Each process card should:
>
> * enter from below
> * become sticky near the top of the viewport
> * remain visible while the next card approaches
> * become partially covered by the next card
> * remain visible behind later cards as a layered stack
>
> Example scroll behavior:
>
> **Understand**
>
> ↓
>
> **Research slides over Understand**
>
> ↓
>
> **Define slides over Research**
>
> ↓
>
> **Explore slides over Define**
>
> ↓
>
> continue until **Iterate**
>
> Do not remove the previous card instantly.
>
> The user should always visually understand that they are progressing through one connected process.
>
> ---
>
> ## Stack depth
>
> When a card becomes inactive behind the current card:
>
> * move it upward approximately 10–18px
> * scale it slightly to around 0.97–0.985
> * slightly reduce its brightness or opacity
> * keep its top edge visible
> * keep its step number visible if possible
>
> Example:
>
> Active card:
>
> `scale(1)`
>
> Previous card:
>
> `scale(.985)`
>
> Two cards behind:
>
> `scale(.97)`
>
> Three cards behind:
>
> `scale(.955)`
>
> Keep the effect subtle.
>
> Avoid exaggerated 3D perspective.
>
> ---
>
> # Card design
>
> Each card should feel like a mini case-study page rather than a basic UI card.
>
> Use:
>
> * large rounded corners around 28–36px
> * off-white / very light gray backgrounds
> * subtle 1px borders
> * extremely soft shadows
> * large typography
> * editorial spacing
> * small lavender accents
> * minimal graphics
>
> Cards should be approximately:
>
> `min-height: 65–75vh`
>
> on desktop.
>
> Allow enough vertical space so every step can be understood before the next one arrives.
>
> ---
>
> # Card layout
>
> Use an asymmetric two-column composition.
>
> ### Left side
>
> Show:
>
> `STEP 01 / 07`
>
> Large process title:
>
> **Understand**
>
> Supporting line:
>
> **Set the foundation**
>
> Short description.
>
> Small process tags.
>
> One key principle or takeaway.
>
> ### Right side
>
> Add a unique visual representing that stage.
>
> Do not repeat the same visual on every card.
>
> Use abstract UI illustrations, lightweight diagrams, interface fragments, sticky notes, flow diagrams, wireframes, prototypes, or data visualizations.
>
> Keep all visuals stylistically consistent.
>
> ---
>
> # CARD 01 — UNDERSTAND
>
> Step:
>
> **01 / 07**
>
> Eyebrow:
>
> **SET THE FOUNDATION**
>
> Title:
>
> **Understand**
>
> Description:
>
> **I start by understanding the product, business context, users, constraints and desired outcomes before deciding what needs to be designed.**
>
> Tags:
>
> `CONTEXT`
> `STAKEHOLDERS`
> `CONSTRAINTS`
> `GOALS`
>
> Principle:
>
> **Good solutions begin with understanding the right context.**
>
> Visual:
>
> Create layered floating cards showing:
>
> * Business goals
> * User needs
> * Technical constraints
> * Success metrics
>
> Add a subtle Venn diagram or relationship diagram behind them.
>
> ---
>
> # CARD 02 — RESEARCH
>
> Eyebrow:
>
> **UNCOVER INSIGHTS**
>
> Title:
>
> **Research**
>
> Description:
>
> **I explore user behaviour, pain points, existing workflows and market patterns to replace assumptions with evidence.**
>
> Tags:
>
> `USER RESEARCH`
> `COMPETITORS`
> `DATA`
> `INSIGHTS`
>
> Principle:
>
> **Research turns assumptions into evidence.**
>
> Visual:
>
> Create a research board containing:
>
> * interview snippets
> * user notes
> * observation cards
> * insights
> * small data visualization
>
> ---
>
> # CARD 03 — DEFINE
>
> Eyebrow:
>
> **FIND THE FOCUS**
>
> Title:
>
> **Define**
>
> Description:
>
> **I organise the findings and identify the key problems the product needs to solve — shaping a clear, shared direction.**
>
> Tags:
>
> `SYNTHESIS`
> `PROBLEM STATEMENT`
> `USER GOALS`
> `PRIORITIES`
>
> Principle:
>
> **Clarity creates momentum.**
>
> Visual:
>
> Create a synthesis board where several insight nodes converge into one highlighted:
>
> **CORE PROBLEM**
>
> Example surrounding nodes:
>
> * User needs
> * Business goals
> * Opportunities
> * Constraints
>
> ---
>
> # CARD 04 — EXPLORE
>
> Eyebrow:
>
> **EXPAND THE POSSIBILITIES**
>
> Title:
>
> **Explore**
>
> Description:
>
> **I generate multiple approaches before committing to a direction, exploring flows, structures and alternative solutions.**
>
> Tags:
>
> `IDEATION`
> `USER FLOWS`
> `SKETCHES`
> `CONCEPTS`
>
> Principle:
>
> **Exploring broadly helps reveal stronger solutions.**
>
> Visual:
>
> Show:
>
> * rough wireframes
> * flow arrows
> * sketches
> * alternative layouts
> * divergent ideas gradually converging
>
> ---
>
> # CARD 05 — DESIGN
>
> Eyebrow:
>
> **SHAPE THE EXPERIENCE**
>
> Title:
>
> **Design**
>
> Description:
>
> **I transform the strongest ideas into clear interfaces and cohesive experiences that balance usability, business needs and visual clarity.**
>
> Tags:
>
> `UX`
> `UI`
> `DESIGN SYSTEM`
> `INTERACTION`
>
> Principle:
>
> **Every visual decision should make the product easier to understand.**
>
> Visual:
>
> Show a refined interface mockup surrounded by small design-system fragments such as:
>
> * typography
> * spacing
> * components
> * color
> * states
>
> ---
>
> # CARD 06 — PROTOTYPE
>
> Eyebrow:
>
> **MAKE IT TANGIBLE**
>
> Title:
>
> **Prototype**
>
> Description:
>
> **I turn static ideas into realistic interactive experiences so flows, behaviour and assumptions can be evaluated before development.**
>
> Tags:
>
> `PROTOTYPING`
> `INTERACTIONS`
> `VALIDATION`
> `FLOW`
>
> Principle:
>
> **A prototype makes invisible assumptions visible.**
>
> Visual:
>
> Show several interface screens connected together with interaction arrows and a prominent device prototype.
>
> ---
>
> # CARD 07 — ITERATE
>
> Eyebrow:
>
> **LEARN & IMPROVE**
>
> Title:
>
> **Iterate**
>
> Description:
>
> **I use feedback, testing and product evidence to continuously refine the experience rather than treating launch as the finish line.**
>
> Tags:
>
> `TESTING`
> `FEEDBACK`
> `REFINEMENT`
> `LEARNING`
>
> Principle:
>
> **Great products improve through continuous learning.**
>
> Visual:
>
> Show:
>
> * feedback summary
> * usability results
> * improvement graph
> * circular iteration loop
> * next opportunities
>
> ---
>
> # Scroll progress
>
> Add a very subtle fixed or sticky process indicator while users move through the stack.
>
> Example:
>
> **03 / 07**
>
> and a thin horizontal progress bar.
>
> It should update:
>
> `01 / 07`
> `02 / 07`
> `03 / 07`
> ...
> `07 / 07`
>
> Do not make the progress indicator visually dominant.
>
> ---
>
> # Direct navigation
>
> In addition to scrolling, provide a subtle navigation control such as:
>
> `01 02 03 04 05 06 07`
>
> or small progress dots.
>
> Clicking a number should smoothly scroll to its corresponding stacked card.
>
> The selected step must stay synchronized with scrolling.
>
> ---
>
> # Card transition
>
> When the next card enters:
>
> * move it upward smoothly
> * fade it from approximately 0.85 → 1 opacity
> * scale from approximately 0.98 → 1
> * slightly reduce the scale of the previous card
> * increase the shadow of the active card
>
> Use smooth premium easing:
>
> `cubic-bezier(.22,1,.36,1)`
>
> Avoid:
>
> * bouncing
> * spinning
> * large zooms
> * excessive parallax
> * scroll hijacking
>
> Normal browser scrolling must remain intact.
>
> ---
>
> # Visual language
>
> Keep the section in **light mode**.
>
> Primary background:
>
> `#FAFAFC` / warm white
>
> Primary text:
>
> near-black
>
> Secondary text:
>
> muted blue-gray
>
> Accent:
>
> purple / lavender similar to:
>
> `#6757FF`
>
> Use extremely subtle lavender gradients only for:
>
> * illustrations
> * selected labels
> * active progress states
>
> Do not use large purple backgrounds.
>
> ---
>
> # Typography
>
> Use a modern grotesk sans-serif style similar to:
>
> **Inter / Satoshi / General Sans**
>
> Use:
>
> large bold headings,
> clean body typography,
> and small uppercase mono-like labels for metadata.
>
> Maintain strong contrast and generous line height.
>
> ---
>
> # Background
>
> Add an extremely subtle technical/design-paper treatment:
>
> * tiny grid
> * small dots
> * faint lines
>
> It should only be visible on close inspection.
>
> Do not make the background noisy.
>
> ---
>
> # Ending transition
>
> After **07 Iterate**, release the sticky stack normally.
>
> Then show a final minimal statement:
>
> **Same process. Different problems.**
>
> Large heading:
>
> **Thoughtful design leads to meaningful experiences.**
>
> Supporting copy:
>
> **Whether it’s a complex system or a simple interface, I use the same human-centered process to turn challenges into opportunities.**
>
> Include a minimal:
>
> **Let’s work together →**
>
> CTA.
>
> The final section should visually separate the process from the next portfolio section.
>
> ---
>
> # Responsive behavior
>
> ### Desktop
>
> Use full card stacking.
>
> Each active card occupies approximately 70–80% of the visible viewport width.
>
> Preserve visible layers of the previous cards.
>
> ### Tablet
>
> Reduce stack offsets and card padding.
>
> Keep the sticky stacking interaction.
>
> ### Mobile
>
> Keep the stacked-card idea, but simplify it.
>
> Cards become single-column.
>
> Visual content moves below text.
>
> Use smaller sticky offsets so previous cards remain slightly visible.
>
> Do not create horizontal scrolling.
>
> ---
>
> # Accessibility
>
> Respect:
>
> `prefers-reduced-motion`
>
> For reduced-motion users, keep the card stack but remove scale and large movement animations.
>
> Maintain accessible color contrast.
>
> All process-navigation controls must have visible focus states.
>
> ---
>
> # Important
>
> The result should feel **inspired by the premium stacked-card storytelling interaction of Designor**, but do not recreate Designor pixel-for-pixel.
>
> Use the interaction concept:
>
> **scroll → sticky card → next card rises → previous card remains layered behind → process progresses**
>
> while keeping the typography, colors, content, spacing, and visual language consistent with my own portfolio.
>
> Completely remove the current process section and replace it with this new stacked-card system.
