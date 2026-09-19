Use this version in Figma Make AI:

> Add a **new section directly below the existing “What I Can Do” section** of my portfolio.
>
> Do not replace, redesign, or move the “What I Can Do” section. Keep all existing sections unchanged and insert this new section immediately after it.
>
> The new section should be titled:
>
> **03 / MY PROCESS**
>
> Main heading:
>
> **How I approach design.**
>
> Supporting text:
>
> **A structured, human-centered process that turns complex problems into simple, meaningful experiences.**
>
> Add a subtle process line:
>
> **People → Insights → Ideas → Experiences → Impact**
>
> Keep the intro minimal, spacious, and consistent with the visual language of the existing portfolio.
>
> ---
>
> ## Main concept
>
> Present my 7-step process as **short stacked cards that progress as the user scrolls**:
>
> **01 Understand
> 02 Research
> 03 Define
> 04 Explore
> 05 Design
> 06 Prototype
> 07 Iterate**
>
> Use a premium **sticky card stacking interaction**:
>
> * each new card rises from below
> * becomes sticky
> * partially covers the previous card
> * previous cards remain visible as layered top edges
> * the active card remains the main focus
> * normal browser scrolling must continue naturally
>
> Keep cards relatively compact, around **420–520px tall on desktop**, not full-screen.
>
> ---
>
> ## Visual style
>
> Match the existing portfolio design system.
>
> Use:
>
> * light mode
> * white or warm off-white background
> * near-black primary text
> * muted gray secondary text
> * soft lavender/purple accents
> * subtle 1px borders
> * 24–30px corner radius
> * very soft shadows
> * generous spacing
> * minimal illustrations
>
> Avoid heavy gradients, glassmorphism, large decorative graphics, or excessive motion.
>
> The card stack itself should be the main visual effect.
>
> ---
>
> ## Card layout
>
> Each card uses a simple two-column layout.
>
> **Left side:**
>
> * `STEP 01 / 07`
> * small eyebrow
> * large process title
> * one short paragraph
> * 3–4 tags
> * one short principle
>
> **Right side:**
>
> Add one lightweight visual related to the current step.
>
> Keep visuals small and secondary to the text.
>
> ---
>
> ## Step 01 — Understand
>
> Eyebrow:
> `SET THE FOUNDATION`
>
> Description:
>
> **Understand the product, users, business context, constraints and desired outcomes before designing.**
>
> Tags:
> `CONTEXT` `STAKEHOLDERS` `CONSTRAINTS` `GOALS`
>
> Principle:
>
> **Good solutions begin with understanding the right context.**
>
> Visual:
> Small floating cards for Business Goals, User Needs, Constraints and Success Metrics.
>
> ---
>
> ## Step 02 — Research
>
> Eyebrow:
> `UNCOVER INSIGHTS`
>
> Description:
>
> **Explore user behaviour, pain points, workflows and market patterns to replace assumptions with evidence.**
>
> Tags:
> `RESEARCH` `DATA` `INSIGHTS` `COMPETITORS`
>
> Principle:
>
> **Research turns assumptions into evidence.**
>
> Visual:
> Small interview notes and insight cards.
>
> ---
>
> ## Step 03 — Define
>
> Eyebrow:
> `FIND THE FOCUS`
>
> Description:
>
> **Turn research into a clear problem, priorities and shared direction.**
>
> Tags:
> `SYNTHESIS` `PROBLEM STATEMENT` `USER GOALS` `PRIORITIES`
>
> Principle:
>
> **Clarity creates momentum.**
>
> Visual:
> User Needs, Business Goals, Constraints and Opportunities converging into a central **Core Problem**.
>
> ---
>
> ## Step 04 — Explore
>
> Eyebrow:
> `EXPAND THE POSSIBILITIES`
>
> Description:
>
> **Generate multiple approaches before committing to a direction.**
>
> Tags:
> `IDEATION` `FLOWS` `SKETCHES` `CONCEPTS`
>
> Principle:
>
> **Exploring broadly reveals stronger solutions.**
>
> Visual:
> Small wireframe and sketch cluster.
>
> ---
>
> ## Step 05 — Design
>
> Eyebrow:
> `SHAPE THE EXPERIENCE`
>
> Description:
>
> **Turn the strongest ideas into clear, useful and visually cohesive interfaces.**
>
> Tags:
> `UX` `UI` `DESIGN SYSTEM` `INTERACTION`
>
> Principle:
>
> **Every visual decision should improve understanding.**
>
> Visual:
> Small interface mockup with typography, color and component samples.
>
> ---
>
> ## Step 06 — Prototype
>
> Eyebrow:
> `MAKE IT TANGIBLE`
>
> Description:
>
> **Create realistic interactive flows to test behaviour and assumptions before development.**
>
> Tags:
> `PROTOTYPING` `INTERACTIONS` `VALIDATION` `FLOW`
>
> Principle:
>
> **Prototypes make assumptions visible.**
>
> Visual:
> A few connected interface screens.
>
> ---
>
> ## Step 07 — Iterate
>
> Eyebrow:
> `LEARN & IMPROVE`
>
> Description:
>
> **Use testing, feedback and evidence to continuously refine the experience.**
>
> Tags:
> `TESTING` `FEEDBACK` `REFINEMENT` `LEARNING`
>
> Principle:
>
> **Great products improve through continuous learning.**
>
> Visual:
> Small feedback loop or improvement chart.
>
> ---
>
> ## Scroll interaction
>
> Use this behavior:
>
> **scroll → next card rises → becomes sticky → previous card remains slightly visible behind**
>
> Keep the effect subtle:
>
> * active card: `scale(1)`
> * previous card: `scale(.985)`
> * older card: `scale(.97)`
>
> Slightly reduce brightness or opacity of deeper cards.
>
> Use smooth easing:
>
> `cubic-bezier(.22,1,.36,1)`
>
> Do not hijack scrolling.
>
> ---
>
> ## Navigation
>
> Add a subtle progress indicator such as:
>
> **01 / 07**
>
> plus 7 tiny dots or step numbers.
>
> Clicking a dot or number should smoothly scroll to that process card.
>
> The active navigation state must stay synchronized with scrolling.
>
> ---
>
> ## Responsive behavior
>
> Desktop:
> compact wide stacked cards.
>
> Tablet:
> reduce card padding and stack offsets.
>
> Mobile:
> use a single-column card layout, move visuals below text, and retain only a small visible stack edge.
>
> ---
>
> ## Section ending
>
> Do not add a CTA or promotional banner at the end.
>
> After **07 Iterate**, release the sticky card stack and continue directly into the next existing portfolio section.
>
> Make sure this new process section feels like a natural continuation of the existing **What I Can Do** section rather than a separate microsite.
