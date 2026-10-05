# Life & Light native exhibition

The published runtime is the existing Unity WebGL/WebXR gallery with a separate
photography hall. These files record the native changes behind this release;
they are not a substitute Unity project or a replacement Three.js scene.

Native editor: Unity 6000.3.24f1. Project on the owner's machine:
`C:\Users\digit\Documents\phone\serengeti-gallery\unity`.

`GalleryExhibitionBuilder.Build` copies the saved Serengeti scene to a separate
`Assets/Scenes/LifeAndLight.unity` release scene. It removes only the older local
photo addition and any previous Life & Light hall from that copy, keeps the
established 33 artwork positions, and appends the 21 new displays. The original
Serengeti scene and older local photo work remain recoverable.

The builder requires exactly 54 unique `GalleryArtwork` indices (0–53), verifies
the solid floor at the exhibition arrival point, and exports WebGL to
`Builds/LifeAndLightControls`. Indices 33–53 follow `src/life-and-light.json` in source
order. The web catalog, native artwork details and VR menu use that same order.

Run `scripts/import-life-and-light.py` with the supplied originals in the owner's
Downloads directory to import unchanged files and create the Unity catalog.
It verifies SHA-256 hashes and spends no media generation credits. JPEG texture
imports are limited to 1024 pixels for GPU efficiency; the original web files
are retained at their supplied dimensions without modification or cropping.

Build with the installed editor using `-batchmode -quit -projectPath <project>`
`-buildTarget WebGL -executeMethod GalleryExhibitionBuilder.Build -logFile <log>`.
The successful log includes `original=33 added=21 total=54 unique indices`.
Copy its versioned Build files to `public/unity/Build` and update
`public/unity/life-and-light-controls-20261004.json`, then run the web build.

The controls release separates the hero's facing direction from camera yaw.
Movement follows the camera's horizontal compass heading, while drag rotates
the camera around the hero through 360 degrees and changes its vertical orbit.
Mouse and touch share one pointer handler; the joystick can be held while a
second finger looks. Camera collision keeps the view inside gallery walls.

The lit Life & Light doorway sits against the shadowed west wall beside chess
at (-19.35, 0, 5.85), facing into the Atrium.
Walk into its wide threshold or tap it to enter the exhibition. The new hall
has a matching Atrium return doorway. VR can also select either portal.
`GalleryMovementValidation` checks 32 actual character-controller traversals,
camera compass directions and orbit closure, and clear walking routes into
both doorway triggers before building. Its report is saved in native `Logs`.
The bridge reports current hero position and camera angles on canvas data
attributes for inspection without showing implementation details in the HUD.

The verified web release source is `deployment/github-live`. The parent web
folder also contains separate local account-sync and photography work; do not
blanket-sync that folder over this release.

Desktop browser play was tested. Physical headset and phone hardware testing
have not been performed; responsive phone/tablet dimensions use browser QA.
