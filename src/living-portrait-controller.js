export class LivingPortraitController {
 state='DORMANT';
 transition(event){const transitions={DORMANT:{invite:'INVITED'},INVITED:{play:'STORY_PLAYING',dismiss:'DORMANT'},STORY_PLAYING:{complete:'CHAPTER_REVEALED',pause:'INVITED',skip:'DORMANT'},CHAPTER_REVEALED:{dismiss:'DORMANT',play:'STORY_PLAYING'}};this.state=transitions[this.state]?.[event]||this.state;return this.state;}
}
