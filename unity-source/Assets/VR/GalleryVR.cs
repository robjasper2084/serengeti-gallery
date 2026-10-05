using UnityEngine;
using UnityEngine.XR;
using UnityEngine.Video;
using WebXR;
using System.Runtime.InteropServices;

public class GalleryVR:MonoBehaviour {
 public Camera desktopCamera;
 public Transform head,curator;
 public WebXRCamera cameras;
 public Material pointerMaterial;
 public Renderer cinemaScreen;
 public Behaviour desktopVisitor;
 public static bool Active {get;private set;}
 CharacterController body;VideoPlayer film;RenderTexture filmTexture;Material screenMaterial;Texture oldTexture;
 WebXRControllerData left,right;LineRenderer ray;Transform menu;TextMesh caption;bool triggerDown,turnReady=true,aDown,bDown;
 [System.Serializable] public class ArtworkInfo {public int index;public string title,artist,description,note;}
 [System.Serializable] public class Catalog {public ArtworkInfo[] items;}
 Catalog catalog;TextMesh artText;Transform artPanel;string artContent="";int artPage;
 public void SetCatalog(string json){catalog=JsonUtility.FromJson<Catalog>(json);}
 string Wrap(string input){var result="";int column=0;foreach(var word in (input??"").Split(' ')){if(column+word.Length>43){result+="\n";column=0;}result+=word+" ";column+=word.Length+1;}return result;}
 void ShowArt(int index){if(catalog?.items==null)return;foreach(var item in catalog.items)if(item.index==index){artContent=Wrap(item.title)+"\n\n"+Wrap(item.artist)+"\n\n"+Wrap(item.description)+"\n\n"+Wrap(item.note);artPage=0;ArtPage();PositionMenu();
 #if UNITY_WEBGL && !UNITY_EDITOR
 SerengetiVRArt(index);
 #endif
 break;}}
 void ArtPage(){if(!artPanel)return;artPanel.gameObject.SetActive(true);var lines=artContent.Split('\n');int pages=Mathf.Max(1,Mathf.CeilToInt(lines.Length/12f));artPage=(artPage+pages)%pages;artText.text="ARTWORK · "+(artPage+1)+" / "+pages+"\n\n"+string.Join("\n",lines,artPage*12,Mathf.Min(12,lines.Length-artPage*12));}
 bool inCinema;string filmUrl;float lastController;
 #if UNITY_WEBGL && !UNITY_EDITOR
 [DllImport("__Internal")]static extern void SerengetiXRState(int active);
 [DllImport("__Internal")]static extern void SerengetiVRArt(int index);
 #endif
 void Awake(){body=GetComponent<CharacterController>();}
 void OnEnable(){WebXRManager.OnXRChange+=Change;WebXRManager.OnControllerUpdate+=Controller;WebXRManager.OnVisibilityChange+=Visibility;}
 void OnDisable(){WebXRManager.OnXRChange-=Change;WebXRManager.OnControllerUpdate-=Controller;WebXRManager.OnVisibilityChange-=Visibility;}
 void Visibility(WebXRVisibilityState state){if(state!=WebXRVisibilityState.VISIBLE){left=null;right=null;film?.Pause();}}
 void Controller(WebXRControllerData data){if(data.hand==1)left=data;else if(data.hand==2)right=data;lastController=Time.unscaledTime;}
 public void SetFilm(string url){System.Uri parsed;if(!System.Uri.TryCreate(url,System.UriKind.Absolute,out parsed)||!(parsed.Scheme=="https"||parsed.IsLoopback))return;filmUrl=url;if(film){film.Stop();film.url=url;film.Prepare();}}
 public void ToggleFilm(string unused){if(!Active)return;if(!inCinema)GoRoom("2");if(film.isPlaying)film.Pause();else if(film.isPrepared)film.Play();else{film.Prepare();caption.text="Preparing film. Press Play again when ready.";}}
 public void FilmSound(string value){if(film)film.SetDirectAudioMute(0,value!="1");}
 public void GoRoom(string value){int room;if(!int.TryParse(value,out room)||room<0||room>3)return;
 var position=room==3?new Vector3(45,0,1f):room==2?new Vector3(1,0,16.5f):room==1?new Vector3(0,0,-17):new Vector3(2,0,8);
 body.enabled=false;transform.position=position;transform.rotation=Quaternion.Euler(0,room==2?0:180,0);body.enabled=true;inCinema=room==2;if(!inCinema)film?.Pause();PositionMenu();
 }
 void Change(WebXRState state,int count,Rect l,Rect r){Active=state==WebXRState.VR;left=null;right=null;desktopVisitor.enabled=!Active;curator.gameObject.SetActive(!Active);
 if(Active){gameObject.SendMessage("SetPaused","1");body.enabled=false;transform.rotation=Quaternion.Euler(0,desktopCamera.transform.eulerAngles.y,0);body.enabled=true;head.localPosition=Vector3.zero;head.localRotation=Quaternion.identity;MakeControls();inCinema=transform.position.z>15.2f;PrepareFilm();menu.gameObject.SetActive(true);PositionMenu();}
 else{film?.Pause();if(screenMaterial)screenMaterial.mainTexture=oldTexture;if(menu)menu.gameObject.SetActive(false);if(artPanel)artPanel.gameObject.SetActive(false);if(ray)ray.enabled=false;gameObject.SendMessage("SetPaused","0");}
 #if UNITY_WEBGL && !UNITY_EDITOR
 SerengetiXRState(Active?1:0);
 #endif
 }
 void PrepareFilm(){if(!film){film=gameObject.AddComponent<VideoPlayer>();film.playOnAwake=false;film.source=VideoSource.Url;film.renderMode=VideoRenderMode.RenderTexture;filmTexture=new RenderTexture(1280,720,0);film.targetTexture=filmTexture;film.audioOutputMode=VideoAudioOutputMode.Direct;film.controlledAudioTrackCount=1;film.SetDirectAudioMute(0,true);film.errorReceived+=(p,error)=>caption.text="Video unavailable. Exit VR and choose a direct MP4 source.";film.prepareCompleted+=p=>caption.text="Film ready. Point at Play / pause and press trigger.";screenMaterial=cinemaScreen.material;oldTexture=screenMaterial.mainTexture;}
 screenMaterial.mainTexture=filmTexture;film.isLooping=filmUrl!=null&&filmUrl.Contains("serengeti-loop.mp4");if(!string.IsNullOrEmpty(filmUrl)&&film.url!=filmUrl){film.url=filmUrl;film.Prepare();}}
 void MakeControls(){if(menu)return;menu=new GameObject("VR room and screening controls").transform;menu.SetParent(transform,false);
 caption=Text(menu,"Left stick: move | Right stick: snap turn\nTrigger: select artwork / control or teleport to floor\nA: play/pause | B: return to atrium",new Vector3(-.65f,.48f,0),.018f);caption.fontSize=36;
 string[] labels={"Atrium","Art halls","Cinema","Life & Light","Play / pause","Sound on","Sound off","Exit VR"};string[] actions={"0","1","2","3","play","sound","mute","exit"};
 for(int i=0;i<labels.Length;i++){var text=Text(menu,labels[i],new Vector3(-.65f,.25f-i*.12f,0),.025f);var hit=text.gameObject.AddComponent<BoxCollider>();hit.center=new Vector3(.38f,-.035f,0);hit.size=new Vector3(.85f,.10f,.035f);text.gameObject.AddComponent<GalleryVRAction>().action=actions[i];}
 artPanel=new GameObject("VR artwork details").transform;artPanel.SetParent(menu,false);artPanel.localPosition=new Vector3(.45f,.55f,0);artText=Text(artPanel,"",Vector3.zero,.012f);var backing=GameObject.CreatePrimitive(PrimitiveType.Cube);backing.transform.SetParent(artPanel,false);backing.transform.localPosition=new Vector3(.63f,-.52f,.05f);backing.transform.localScale=new Vector3(1.38f,1.23f,.03f);Object.Destroy(backing.GetComponent<Collider>());var panelMat=new Material(Shader.Find("Unlit/Color"));panelMat.color=new Color(.035f,.05f,.045f);backing.GetComponent<Renderer>().material=panelMat;
 string[] artLabels={"Previous","Next","Close"};string[] artActions={"art-prev","art-next","art-close"};for(int i=0;i<3;i++){var b=Text(artPanel,artLabels[i],new Vector3(i*.44f,-1.04f,-.01f),.017f);var box=b.gameObject.AddComponent<BoxCollider>();box.center=new Vector3(.17f,-.03f,0);box.size=new Vector3(.4f,.12f,.05f);b.gameObject.AddComponent<GalleryVRAction>().action=artActions[i];}artPanel.gameObject.SetActive(false);
 ray=new GameObject("Controller pointer").AddComponent<LineRenderer>();ray.material=pointerMaterial;ray.startWidth=.006f;ray.endWidth=.002f;ray.positionCount=2;ray.useWorldSpace=true;
 }
 TextMesh Text(Transform parent,string text,Vector3 position,float size){var t=new GameObject(text).AddComponent<TextMesh>();t.transform.SetParent(parent,false);t.transform.localPosition=position;t.font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");t.GetComponent<Renderer>().sharedMaterial=t.font.material;t.text=text;t.characterSize=size;t.fontSize=48;t.color=new Color(1,.85f,.58f);t.anchor=TextAnchor.UpperLeft;return t;}
 void PositionMenu(){if(!menu)return;var facing=Active?head.forward:transform.forward;facing.y=0;if(facing.sqrMagnitude<.01f)facing=transform.forward;facing.Normalize();menu.position=(Active?head.position:transform.position+Vector3.up*1.6f)+facing*2;menu.rotation=Quaternion.LookRotation(facing);}
 void LateUpdate(){if(!Active)return;
 head.localPosition=InputTracking.GetLocalPosition(XRNode.CenterEye);head.localRotation=InputTracking.GetLocalRotation(XRNode.CenterEye);
 if(Time.unscaledTime-lastController>1){left=null;right=null;}
 if(left!=null&&left.enabled){Vector3 forward=head.forward;forward.y=0;forward.Normalize();var move=forward*left.thumbstickY+Vector3.Cross(Vector3.up,forward)*left.thumbstickX;body.Move((Vector3.ClampMagnitude(move,1)*.85f+Vector3.down*2)*Time.deltaTime);}
 if(right!=null&&right.enabled){if(Mathf.Abs(right.thumbstickX)<.3f)turnReady=true;else if(turnReady&&Mathf.Abs(right.thumbstickX)>.7f){transform.RotateAround(head.position,Vector3.up,Mathf.Sign(right.thumbstickX)*30);turnReady=false;}
 bool a=right.buttonA>.5f,b=right.buttonB>.5f;if(a&&!aDown)ToggleFilm("");if(b&&!bDown)GoRoom("0");aDown=a;bDown=b;
 var origin=transform.TransformPoint(right.position);var direction=transform.rotation*right.rotation*Vector3.forward;ray.enabled=true;ray.SetPosition(0,origin);bool hit=Physics.Raycast(origin,direction,out var target,12,~(1<<9));ray.SetPosition(1,hit?target.point:origin+direction*6);
 bool trigger=right.trigger>.65f;if(trigger&&!triggerDown&&hit)Select(target);triggerDown=trigger;
 }else{ray.enabled=false;triggerDown=false;aDown=false;bDown=false;}
 bool cinema=transform.position.z>15.2f;if(inCinema&&!cinema)film?.Pause();inCinema=cinema;
 }
 void Select(RaycastHit hit){var piano=hit.collider.GetComponent<GalleryPianoTarget>();if(piano){piano.Select();return;}var chess=hit.collider.GetComponent<GalleryChessTarget>();if(chess){chess.Select();return;}var action=hit.collider.GetComponent<GalleryVRAction>();if(action){switch(action.action){case "art-prev":artPage--;ArtPage();break;case "art-next":artPage++;ArtPage();break;case "art-close":artPanel.gameObject.SetActive(false);break;case "play":ToggleFilm("");break;case "sound":FilmSound("1");break;case "mute":FilmSound("0");break;case "exit":WebXRManager.Instance.ToggleVR();break;default:GoRoom(action.action);break;}return;}
 var portal=hit.collider.GetComponent("GalleryPortal");if(portal){var destination=portal.GetType().GetField("room");if(destination!=null)GoRoom(destination.GetValue(portal).ToString());return;}
 var artwork=hit.collider.GetComponent("GalleryArtwork");if(artwork){var field=artwork.GetType().GetField("index");if(field!=null)ShowArt((int)field.GetValue(artwork));return;}
 if(hit.normal.y>.85f&&hit.point.y<.5f){var p=hit.point+Vector3.up*.04f;if(!Physics.CheckCapsule(p+Vector3.up*.4f,p+Vector3.up*1.5f,.3f,~(1<<9),QueryTriggerInteraction.Ignore)){body.enabled=false;transform.position=p;body.enabled=true;PositionMenu();}}
 }
 void OnDestroy(){if(filmTexture)filmTexture.Release();if(ray)Destroy(ray.gameObject);}
}
