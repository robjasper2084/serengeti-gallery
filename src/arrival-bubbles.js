// Count time spent looking at the lobby; each invitation appears only once.
export function createArrivalBubbleTimers(cues,{isVisible,now=()=>performance.now(),schedule=setTimeout,cancel=clearTimeout}){
 const states=cues.map(cue=>({...cue,remaining:cue.delay,timer:null,started:0,shown:false}));
 function sync(){
  const visible=isVisible();
  for(const state of states){
   if(state.shown)continue;
   if(!visible&&state.timer!==null){
    cancel(state.timer);state.timer=null;state.remaining=Math.max(0,state.remaining-(now()-state.started));
   }else if(visible&&state.timer===null){
    state.started=now();
    state.timer=schedule(()=>{
     state.timer=null;
     state.remaining=Math.max(0,state.remaining-(now()-state.started));
     if(!isVisible())return;
     state.shown=true;state.reveal();
    },state.remaining);
   }
  }
 }
 sync();
 return {sync,dispose(){for(const state of states){if(state.timer!==null)cancel(state.timer);state.shown=true;}}};
}
