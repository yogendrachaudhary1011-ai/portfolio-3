Paste this directly into **Figma Make AI**. It is written so Make understands both the visual redesign and the interaction logic.

> Redesign only the **“How I approach design” / Design Process** section of my existing portfolio website. Keep the rest of the website unchanged.
>
> I want this section to feel like a **visual journey through my product design process**, not a static information card. Use a clean, premium **light-mode editorial/product-design aesthetic** with subtle purple accents, lots of white space, strong typography, thin borders, soft gradients, and refined micro-interactions.
>
> ### Overall visual direction
>
> Create a spacious section with:
>
> * White / very light warm-gray background
> * Very subtle grid or technical-paper texture in the background
> * Primary text: near-black
> * Secondary text: muted gray
> * Accent: soft lavender / purple
> * Thin #E5E5EA-style borders
> * Large modern typography
> * Rounded corners around 20–28px
> * Very soft shadows only where necessary
> * Avoid glassmorphism, heavy gradients, excessive glow, or futuristic dark styling
> * The overall result should feel like a **professional senior product designer portfolio**
>
> ---
>
> ### Header
>
> At the top of the section add a small eyebrow:
>
> **03 / MY PROCESS**
>
> Main heading:
>
> **How I approach design.**
>
> Make “design.” slightly purple or use a subtle purple gradient.
>
> Supporting copy:
>
> **A repeatable path from a fuzzy problem to a considered product direction — adapted to the people, the constraints, and the timeline.**
>
> Keep the title large and editorial, but make sure the process itself remains the visual focus.
>
> ---
>
> ### Process navigation
>
> Directly below the introduction, create a **horizontal connected process timeline** containing these 7 stages:
>
> 01 — Understand
> Set the foundation
>
> 02 — Research
> Uncover insights
>
> 03 — Define
> Find the focus
>
> 04 — Explore
> Generate possibilities
>
> 05 — Design
> Turn ideas into solutions
>
> 06 — Prototype
> Make it real
>
> 07 — Iterate
> Learn and improve
>
> Every stage should have:
>
> * Circular numbered node
> * Stage name
> * Short supporting label
> * Thin connecting line between nodes
>
> The current stage should be visually obvious using:
>
> * Filled purple circle
> * Slight surrounding halo
> * Darker/bolder stage title
> * Purple progress line extending to the active stage
>
> Completed stages can display a small check mark or subtle completed treatment.
>
> Future stages should remain neutral gray.
>
> ---
>
> ### Main active-process card
>
> Under the timeline, create one large editorial card that displays the currently active stage.
>
> Layout the card in roughly three zones:
>
> **Left**
>
> A very large outlined stage number such as:
>
> `03`
>
> The number should act as a graphic element rather than normal text.
>
> **Center**
>
> Small eyebrow such as:
>
> `FIND THE FOCUS`
>
> Large stage title:
>
> `Define`
>
> Description:
>
> `Organise the findings and identify the key problems the product needs to solve — shaping a clear, shared direction.`
>
> Add small pill tags such as:
>
> `SYNTHESIS`
> `PROBLEM STATEMENT`
> `USER GOALS`
> `PRIORITIES`
>
> At the bottom show a small insight:
>
> `A well-defined problem unlocks better solutions.`
>
> **Right**
>
> Add one short principle / quote related to that stage:
>
> `Clarity at this stage creates momentum for everything that follows.`
>
> Keep this area minimal and editorial.
>
> Add subtle previous and next arrow buttons in the upper-right corner of the card.
>
> ---
>
> ## MOST IMPORTANT: INTERACTION
>
> This process must be **interactive through both page scrolling and direct clicking**.
>
> ### Scroll interaction
>
> Create a scroll-driven process experience.
>
> When the user reaches this section:
>
> * Keep the main visual/process interface **sticky while the user scrolls through the seven stages**.
> * Do NOT create a visible nested scrollbar.
> * Normal page scrolling should control the process.
> * Divide the process scroll range into 7 equal stages.
>
> As the user scrolls downward:
>
> `Understand → Research → Define → Explore → Design → Prototype → Iterate`
>
> As the user scrolls upward, move through the stages in reverse.
>
> The transition should feel controlled and deliberate rather than hypersensitive.
>
> Each stage should stay visible long enough to be read before progressing to the next stage.
>
> After stage 07 is completed, release the sticky section and continue normally to the next portfolio section.
>
> ---
>
> ### State transition animation
>
> Whenever the process changes:
>
> 1. Animate the timeline progress line to the new node.
> 2. Change the active numbered circle.
> 3. Fade/slide the old process-card content out.
> 4. Update the large background number.
> 5. Fade/slide the new title and description in.
> 6. Animate the tags in with a short stagger.
> 7. Update the right-side principle.
>
> Use approximately **350–500ms** transitions with smooth premium easing.
>
> Use subtle movement only:
>
> * opacity
> * 8–20px vertical movement
> * slight scale changes around 0.98 → 1
>
> Avoid dramatic zooming, spinning, bouncing, or distracting animations.
>
> ---
>
> ### Click interaction
>
> Every timeline stage must also be clickable.
>
> For example, if the user clicks:
>
> `05 Design`
>
> immediately activate stage 05 and smoothly move the scroll position to the corresponding point in the process section.
>
> Clicking another stage should:
>
> * Change the active timeline node
> * Update the progress line
> * Replace the content card
> * Move to the correct scroll position
>
> The scroll state and clicked state must always stay synchronized.
>
> Clicking the left/right arrow buttons should also move to the previous/next stage and update the corresponding scroll position.
>
> Do not let click navigation and scroll navigation become separate states.
>
> ---
>
> ### Content for all stages
>
> Create meaningful content for every state.
>
> **01 Understand**
>
> Eyebrow: `SET THE FOUNDATION`
>
> Description:
> `Understand the product, business context, users, constraints and desired outcomes before deciding what needs to be designed.`
>
> Tags:
> `CONTEXT` `STAKEHOLDERS` `CONSTRAINTS` `GOALS`
>
> Principle:
> `Good solutions begin with understanding the right context.`
>
> ---
>
> **02 Research**
>
> Eyebrow: `UNCOVER INSIGHTS`
>
> Description:
> `Explore user behaviour, pain points, existing workflows and market patterns to replace assumptions with evidence.`
>
> Tags:
> `USER RESEARCH` `COMPETITORS` `DATA` `INSIGHTS`
>
> Principle:
> `Research turns assumptions into evidence.`
>
> ---
>
> **03 Define**
>
> Eyebrow: `FIND THE FOCUS`
>
> Description:
> `Organise the findings and identify the key problems the product needs to solve — shaping a clear, shared direction.`
>
> Tags:
> `SYNTHESIS` `PROBLEM STATEMENT` `USER GOALS` `PRIORITIES`
>
> Principle:
> `Clarity at this stage creates momentum for everything that follows.`
>
> ---
>
> **04 Explore**
>
> Eyebrow: `EXPAND THE POSSIBILITIES`
>
> Description:
> `Generate multiple approaches before committing to a direction, exploring flows, structures and alternative solutions.`
>
> Tags:
> `IDEATION` `USER FLOWS` `SKETCHES` `CONCEPTS`
>
> Principle:
> `Exploring broadly helps reveal stronger solutions.`
>
> ---
>
> **05 Design**
>
> Eyebrow: `SHAPE THE EXPERIENCE`
>
> Description:
> `Transform the strongest ideas into clear interfaces and cohesive experiences that balance usability, business needs and visual clarity.`
>
> Tags:
> `UX` `UI` `DESIGN SYSTEM` `INTERACTION`
>
> Principle:
> `Every visual decision should make the product easier to understand.`
>
> ---
>
> **06 Prototype**
>
> Eyebrow: `MAKE IT TANGIBLE`
>
> Description:
> `Turn static ideas into realistic interactive experiences so flows, behaviour and assumptions can be evaluated before development.`
>
> Tags:
> `PROTOTYPING` `INTERACTIONS` `VALIDATION` `FLOW`
>
> Principle:
> `A prototype makes invisible assumptions visible.`
>
> ---
>
> **07 Iterate**
>
> Eyebrow: `LEARN & IMPROVE`
>
> Description:
> `Use feedback, testing and product evidence to refine the experience continuously rather than treating launch as the finish line.`
>
> Tags:
> `TESTING` `FEEDBACK` `REFINEMENT` `LEARNING`
>
> Principle:
> `Great products improve through continuous learning.`
>
> ---
>
> ### Progress indicator
>
> Somewhere subtly inside the card show:
>
> `STEP 03 / 07`
>
> Change it automatically for each state.
>
> Optionally include a very thin progress bar:
>
> `1/7 = 14%`
> `2/7 = 29%`
> ...
> `7/7 = 100%`
>
> ---
>
> ### Responsive behaviour
>
> Desktop:
>
> * Full horizontal process timeline
> * Large process card
> * Sticky scroll interaction
>
> Tablet:
>
> * Keep horizontal timeline where possible
> * Allow horizontal overflow only for the timeline if necessary
>
> Mobile:
>
> * Do not squeeze all seven stages into one line
> * Show the active stage with previous/next stage indicators
> * Main card becomes single-column
> * Keep tap navigation
> * Keep scroll-driven stage transitions
> * Large number moves behind or above the content
> * Quote/principle moves below the main description
>
> ---
>
> ### UX requirements
>
> Preserve normal browser scrolling. Do not trap the user inside the component.
>
> Support:
>
> * Mouse wheel
> * Trackpad
> * Touch scrolling
> * Clicking process nodes
> * Previous / next buttons
>
> Also allow keyboard navigation with left/right arrow keys when the process is focused.
>
> Respect `prefers-reduced-motion` and remove movement-heavy animation for those users.
>
> Keep all process buttons and nodes accessible with visible focus states.
>
> ---
>
> ### Final goal
>
> The user should immediately understand that this is a **7-step design journey**.
>
> It should visually communicate:
>
> **Understand → Research → Define → Explore → Design → Prototype → Iterate**
>
> The section should feel like the visitor is **moving through my design process while scrolling**, while still letting them jump directly to any stage by clicking it.
>
> Make it polished, responsive, functional and production-ready. Do not redesign other parts of the portfolio.

One detail I strongly recommend keeping is the **sticky process + normal page scroll** behavior rather than making the mouse wheel behave like a carousel. It will feel much more natural in a portfolio while still creating the “process unfolds as I scroll” effect.
