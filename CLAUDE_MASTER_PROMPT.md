# CLAUDE CODE — MASTER PROJECT INSTRUCTIONS

## Somatic: 3D Pain Visualization & Research Platform

### 1. Project overview

You are helping develop **Somatic**, a web-based, interactive pain visualization platform.

The purpose is to allow people to visually communicate subjective physical pain experiences through painting, textures, colors, patterns, animations, and spatial mapping on a realistic 3D human body.

The long-term goal is to support research into how different visual representations communicate pain and how individuals perceive their own symptoms.

This is not simply a symptom tracker. It should eventually become a flexible visual language for describing pain.

**The core research question is:**

Which visual elements—colors, patterns, textures, movement, intensity, and spatial positioning—do people feel best represent their pain experiences?

We also want to explore how people communicate changes in pain over time, including movement, spreading, shrinking, intensifying, and changing sensations.

### 2. Current project and development principles

There is an existing starter project containing a basic two-dimensional body-painting interface, visual styles, and a comparison exercise.

**Before modifying anything:**

1. Inspect the entire existing repository.
2. Read `README.md` and `CLAUDE.md`, if present.
3. Identify existing components, functionality, dependencies, and limitations.
4. Preserve working functionality where possible.
5. Create a documented development roadmap.
6. Implement only the next manageable milestone rather than attempting the entire final product at once.

For this development stage:

- Do not integrate AI, LLMs, model APIs, or machine learning.
- Do not implement medical diagnosis or treatment recommendations.
- Do not collect or transmit real patient information.
- Use synthetic research examples and test data.
- Keep the application functional offline wherever feasible.
- Favor reliable, maintainable, extensible code over impressive but fragile demonstrations.
- Write automated tests for important functionality.

The application should remain useful without AI, even if AI-assisted features are introduced in a separate future phase.

---

# PART I — THE 3D BODY PAINTING EXPERIENCE

### 3. Interactive 3D human body

Eventually replace the basic 2D-only interface with a three-dimensional, rotatable human body.

Users should be able to:

- Rotate the model through 360 degrees.
- Zoom in on specific anatomical regions.
- Pan the camera around the model.
- Paint directly onto the visible 3D surface.
- Paint on the front, back, sides, arms, legs, hands, and feet.
- View their paintings from any angle.
- Switch between painting and camera navigation.
- Reset the camera to standard front, back, and side views.

The model should have recognizable anatomical proportions and sufficient geometric detail for accurate painting.

Explore Three.js and React Three Fiber if appropriate for the existing project's architecture.

Use an appropriately licensed, neutral anatomical model. Do not rely on unlicensed commercial assets.

**Important technical requirement:**

Paint marks must remain attached to the correct anatomical positions when users rotate or move the camera.

A mark painted on the shoulder must stay on that shoulder, not move with the screen.

Investigate mesh raycasting and surface-based painting techniques. Compare UV texture painting with geometry-attached stroke representations, considering seams, persistence, performance, and future animation support.

Design the system so 3D painting data can be saved, edited, exported, and reloaded accurately.

### 4. Customizable paintbrush system

The brushes are one of the most important parts of this application.

Users should eventually be able to express pain through multiple visual properties, not merely paint a solid color.

Build a modular brush architecture supporting different brush types.

#### Initial brush types

**Soft glow**

- Diffuse, blurred color
- Adjustable opacity and radius
- Useful for representing broad sensations

**Sharp or stabbing**

- Angular, pointed visual marks
- Adjustable sharpness, size, and density
- Repeated strokes permitted

**Burning**

- Layered gradients with optional flickering or flowing visual effects
- Adjustable colors and animation intensity

**Throbbing**

- Pulsing circles or other shapes
- Adjustable pulse frequency and amplitude

**Tingling**

- Small dots or particles
- Adjustable spacing, density, and motion

**Pressure**

- Dense, layered shading
- Adjustable concentration and softness

**Electric**

- Jagged, branching line patterns
- Optional animated effects

**Custom brush**

- Allow users to configure colors, pattern parameters, softness, opacity, size, and movement without relying on predefined sensation labels.

These are example visual metaphors, not scientifically established mappings between sensations and appearances.

The user—not the application—should determine whether any visual effect accurately represents their experience.

### 5. Brush controls and editing

Implement an extensible system for:

- Brush size
- Color picker
- Opacity
- Edge softness
- Texture and pattern density
- Animation speed, where applicable
- Stroke spacing
- Eraser
- Undo and redo
- Selection and deletion
- Independent painting layers

Support overlapping pain sensations at the same anatomical location.

For example, users should be able to paint a diffuse blue region underneath a smaller, red, pulsating region.

Brush properties should remain editable after a stroke has been created whenever technically feasible.

Provide meaningful keyboard and pointer interaction support, and consider touch-device support in later phases.

---

# PART II — TIME AND PAIN MOVEMENT

### 6. Pain timeline and timelapse

This is a major long-term feature.

Users should be able to represent how pain changes over time.

**Do not treat timelapse as merely recording the screen while someone paints.**

Instead, build a timeline-based visualization system with saved, time-associated pain states.

For example:

- 9:00 AM — Pain appears in the lower back.
- 11:00 AM — The painful region expands.
- 1:00 PM — The sensation becomes sharper.
- 3:00 PM — Pain is also reported down the right leg.
- 6:00 PM — The lower-back region becomes smaller while the leg region remains.

Users should be able to create and edit each state independently.

#### Timeline editor

Eventually include:

- A horizontal timeline
- Add, delete, and duplicate keyframes
- Custom dates and times
- Play and pause
- Playback speed adjustment
- Timeline scrubbing
- Loop playback
- Before-and-after comparisons
- Export as video or animated format
- Save and reopen timeline projects

#### Pain movement visualization

Allow users to see:

- Where pain first appeared
- Where it was subsequently recorded
- How its reported spatial extent changed
- How its represented intensity changed
- How visual sensation properties changed
- When previously marked regions were removed

Provide optional trails or overlays showing changes between recorded states.

For instance, a visualization could show a sequence of painted regions extending from the neck toward the shoulder.

**Do not automatically interpret this as actual physiological movement or spreading unless the user explicitly reports it that way.**

A difference between two snapshots is not necessarily evidence of continuous movement.

### 7. Interpolation between time points

Investigate visually transitioning between recorded states.

Possible effects include:

- Fading regions in and out
- Smoothly expanding or shrinking shapes
- Changing intensity
- Transitioning colors
- Animating user-defined movement paths
- Transitioning between sensation styles

Prioritize accurate representation over visually smooth but misleading animations.

Never invent intermediate pain states and present them as reported observations.

Distinguish recorded states from interpolated visual transitions.

Allow interpolation to be disabled.

---

# PART III — RESEARCH AND VISUAL LANGUAGE

### 8. Visualization comparison system

Develop a research-oriented comparison feature that can later support structured experiments.

The application should eventually allow researchers to present multiple visualizations and ask participants which best represents a described sensation.

Possible tasks:

- Compare two animated brushes.
- Compare different colors for the same abstract sensation.
- Compare static and animated representations.
- Adjust a visualization until it feels accurate.
- Rank several visualization styles.
- Compare responses to identical synthetic prompts.

Research questions could include:

- Do people prefer abstract or anatomically realistic representations?
- Are moving textures more expressive than static colors?
- Do visual preferences vary between individuals?
- Does combining multiple visual elements improve expressiveness?
- How accurately can another viewer interpret a person's visualization?

Do not assume these questions have established answers.

### 9. Future research data structures

Prepare the architecture for separate, optional research functionality.

Potential future experimental records might include:

- Anonymous study-generated participant identifier
- Study or experiment identifier
- Synthetic scenario identifier
- Selected visualization
- Visualization parameters
- Rating or ranking
- Trial completion metadata
- Optional participant-provided explanation

Do not activate participant-data collection in the initial version.

Research functionality must remain separate from the foundational graphics engine.

Any real human-subject study would require an appropriate research protocol, consent process, privacy protections, and institutional review before data collection.

For the current project, use only fictional participants and synthetic trial data.

---

# PART IV — TECHNICAL ARCHITECTURE

### 10. Recommended application structure

Inspect the existing stack before deciding which dependencies to add.

If appropriate, favor:

- React and TypeScript for the interface
- Three.js / React Three Fiber for 3D rendering
- SVG or Canvas for applicable 2D workflows
- A modular rendering system for different brush effects
- A predictable state-management approach
- JSON-based project serialization
- IndexedDB or local files for offline project persistence
- Vitest and Playwright for automated testing

Separate the following responsibilities:

**3D Viewer**
Handles body model rendering, lighting, camera movement, and raycasting.

**Painting Engine**
Handles brush placement, stroke geometry, surface coordinates, erasing, and editing.

**Brush Library**
Defines the rendering and configurable parameters of each brush.

**Layer Manager**
Maintains overlapping and independently editable visual elements.

**Timeline Engine**
Stores and displays time-associated pain states.

**Animation Engine**
Handles procedural brush animation and transitions between explicitly defined timeline states.

**Project Storage**
Handles save/load, migrations, and exports.

**Research Module**
Eventually handles study designs and synthetic comparisons, remaining independent from the drawing engine.

Avoid tightly coupling the 3D renderer to research-study logic.

### 11. Data persistence

Design a versioned project format so future versions can reopen previously saved scenes.

At minimum, store:

- Project schema version
- Model identity/version
- Brush type and parameters
- Stroke positions in model space
- Layer relationships
- Timeline states and timestamps
- Explicitly defined transitions
- Relevant display settings

Do not store only flat screenshots.

The underlying editable artwork and timeline must be recoverable.

Avoid storing device-specific or transient rendering objects as project data.

Support migration when the schema changes.

### 12. Performance and testing

The application should eventually handle many brush strokes, animated overlays, and multiple timeline states without becoming unusable.

Implement performance-aware rendering and avoid unnecessary full-scene rebuilds.

Tests should cover:

- Painting accuracy after rotating the body
- Accurate stroke persistence after saving and loading
- Undo and redo behavior
- Overlapping layers
- Erasing and editing
- Timeline keyframe updates
- Consistency between saved and displayed data
- Scene performance with increasing stroke counts
- Prevention of unexpected external data transmission

---

# PART V — DEVELOPMENT ROADMAP

Do not build everything at once.

## Phase 1 — Stabilize the current prototype

- Inspect existing code.
- Fix broken interactions and dependencies.
- Establish an understandable architecture.
- Add automated tests.
- Improve the current 2D brush system.
- Support reliable local saving and reopening.
- Preserve existing useful functionality.

**Completion requirement:** Users can create, edit, save, reopen, and export a 2D visualization without losing their work.

## Phase 2 — Build the 3D viewer

- Load a properly licensed human model.
- Implement rotation, zoom, and pan.
- Add preset camera views.
- Implement reliable cursor-to-model raycasting.
- Add a single basic brush capable of painting on the model.
- Verify stroke persistence across different viewing angles.

**Completion requirement:** Users can paint a mark on a specific body location, rotate the model, and see the same mark remain correctly positioned.

## Phase 3 — Complete the 3D painting engine

- Add multiple brush styles.
- Add brush parameter controls.
- Support separate layers.
- Implement erase, undo, and redo.
- Save and reopen complete 3D scenes.
- Add animated visual effects.

**Completion requirement:** A user can create and edit a multilayer 3D pain representation with multiple brush types and persist it reliably.

## Phase 4 — Timeline and pain movement

- Add time-associated keyframes.
- Allow independent editing at each time point.
- Add timeline navigation and playback.
- Support configurable transitions.
- Add recorded-state comparison.
- Implement optional movement visualization.
- Add animation export.

**Completion requirement:** A user can represent pain in multiple anatomical locations at several different times and play back the resulting chronological visualization.

## Phase 5 — Research-oriented customization

- Expand the custom brush editor.
- Allow reproducible visual presets.
- Add synthetic visualization comparison exercises.
- Add optional ratings and rankings.
- Support exports suitable for subsequent analysis.
- Improve accessibility and device compatibility.

**Completion requirement:** Researchers can configure and reproduce synthetic visual-comparison exercises without changing application code.

## Phase 6 — Future research readiness

After suitable ethics and privacy reviews, consider:

- Consented human-participant studies
- Structured data-collection workflows
- Longitudinal pain representation research
- Accessibility studies
- Cross-participant comparisons
- Research-friendly export formats

Do not build or activate live human-subject data collection without explicit authorization.

---

# PART VI — HOW YOU SHOULD WORK

### 13. Claude Code development workflow

At the start of each development phase:

1. Inspect the relevant existing implementation.
2. Explain what needs to change and why.
3. Propose a small implementation plan.
4. Identify potential risks and technical tradeoffs.
5. Implement the smallest useful increment.
6. Run available tests and verify the feature.
7. Summarize files changed and known limitations.
8. Update documentation and the project roadmap.

Do not rewrite the entire application unnecessarily.

Do not introduce major dependencies without explaining their purpose.

When a technical choice is uncertain, compare alternatives before implementing.

Use clear component boundaries and reusable interfaces so that the application can grow without major architectural rewrites.

Maintain the project's existing Git history and commit focused, working milestones when instructed.

### 14. What you should do FIRST

Do not start by implementing the full 3D environment.

Your first assignment is:

1. Read and inspect the starter project.
2. Explain its current architecture.
3. Identify what should be preserved and refactored.
4. Draft a long-term component architecture supporting 3D painting, custom brushes, and timeline keyframes.
5. Create or update a `ROADMAP.md` file containing the development phases and acceptance criteria.
6. Begin Phase 1 with one small, testable improvement to the existing brush system or project-persistence architecture.

**The ultimate vision is an expressive, customizable, three-dimensional pain visualization studio that can show both how pain feels and how an individual's reported experience changes over time.**

Build the foundation carefully so we can reach that vision without rebuilding the entire product later.

---

## Architectural recommendation

Build the 3D painting system around editable, time-aware strokes from the beginning. Even before implementing the timeline, every brush stroke should be stored as structured information tied to the body model, rather than just pixels in an image.

That allows you to add animation, editing, and longitudinal visualization later without redesigning the entire graphics engine.
