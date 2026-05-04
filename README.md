# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--adobe-ui-dashboards--vishnuadobe.aem.page/
- Live: https://main--adobe-ui-dashboards--vishnuadobe.aem.live/

## Documentation

Before using the aem-boilerplate, we recommand you to go through the documentation on https://www.aem.live/docs/ and more specifically:
1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `adobe-ui-dashboards` directory in your favorite IDE and start coding :)

## Blocks

### Cards Block

Displays a responsive grid of app tiles with detailed information in a sidebar drawer.

**Features:**
- Responsive grid (1-3 columns based on viewport)
- App icon display with monogram fallback
- Click-to-open drawer with app details
- Optional app preview images centered in drawer
- "Launch App" button with hover animations
- Keyboard accessible (ESC to close)
- Mobile-optimized full-screen drawer

**Content Structure** (5 columns):
| Icon | Title | Description | Link | Image |
|------|-------|-------------|------|-------|
| App icon/SVG | App name | Description text | App URL | Optional screenshot |

Example authoring in AEM:
```
| Icon | Title | Description | Link | Image |
| [icon.svg] | Adobe Forum | Collaborative forum for employees | https://forum.adobe.com | [screenshot.png] |
```

**Styling:**
- Mobile-first responsive design
- Uses Adobe Spectrum design tokens
- Smooth transitions and hover states
- Centered image display (65% width) in drawer
