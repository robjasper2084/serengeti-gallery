using UnityEngine;
using System.Runtime.InteropServices;

public class GalleryVisitor : MonoBehaviour {
 float yaw=180,pitch=9,touchForward,touchHorizontal,arrivalOrbit;
 bool firstPerson,home=true,paused,motion=true,dragged;
 int currentRoom=-1;
 Vector3 pressPosition;
 CharacterController controller;
 Camera cam;
 Animation anim;
 Transform character;
 string walkName,idleName,backwardName;
 Vector3 smoothMove;
 float verticalVelocity,lastNavigationReport;bool runHeld,jumpRequested;
 public void SetRun(string value){runHeld=value=="1";}
 public void Jump(string unused){if(!paused&&!home)jumpRequested=true;}
 const float WalkSpeed=2.4f;
 const float RunSpeed=4.2f;
 const float ForwardClipSpeed=.20f/.58f/.8f*(1.9f/1.3f);
 const float BackwardClipSpeed=.16f/.58f/.8f*(1.9f/1.3f);
 Renderer[] characterRenderers;
 #if UNITY_WEBGL && !UNITY_EDITOR
 [DllImport("__Internal")] static extern void SerengetiArtwork(int index);
 [DllImport("__Internal")] static extern void SerengetiVisitStarted();
 [DllImport("__Internal")] static extern void SerengetiRoomChanged(int room);
 [DllImport("__Internal")] static extern void SerengetiNavigation(float x,float z,float yaw,float pitch);
 #endif
 void Awake(){
  controller=GetComponent<CharacterController>();cam=GetComponentInChildren<Camera>();
  gameObject.layer=9;cam.nearClipPlane=.08f;
  character=transform.Find("Gallery curator");characterRenderers=character.GetComponentsInChildren<Renderer>();
  anim=character.GetComponentInChildren<Animation>();
  if(anim)foreach(AnimationState a in anim){a.wrapMode=WrapMode.Loop;if(a.name.ToLower().Contains("backward"))backwardName=a.name;else if(a.name.ToLower().Contains("walk"))walkName=a.name;if(a.name.ToLower().Contains("idle"))idleName=a.name;}
  Application.targetFrameRate=60;
  if(!GetComponent<GalleryCinemaSeat>())gameObject.AddComponent<GalleryCinemaSeat>();
  #if UNITY_WEBGL && !UNITY_EDITOR
  WebGLInput.captureAllKeyboardInput=false;
  #endif
  ShowHome("");
 }
 public void SetJoystick(string value){var parts=value.Split(',');if(parts.Length!=2)return;float.TryParse(parts[0],System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out touchHorizontal);float.TryParse(parts[1],System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out touchForward);if(home&&Mathf.Abs(touchForward)+Mathf.Abs(touchHorizontal)>.1f)BeginVisit("");}
 public void LookTouch(string value){if(paused)return;if(home)BeginVisit("");var parts=value.Split(',');if(parts.Length!=2)return;float x,y;if(float.TryParse(parts[0],System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out x)&&float.TryParse(parts[1],System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out y)){yaw=Mathf.Repeat(yaw+x*.22f,360);pitch=Mathf.Clamp(pitch+y*.18f,-60,70);}}
 public void SetForward(string value){float.TryParse(value,out touchForward);if(touchForward!=0&&home)BeginVisit("");}
 public void ShowHome(string unused){
  GetComponent<GalleryCinemaSeat>()?.StandCinema("");
  home=true;paused=false;firstPerson=false;touchForward=0;touchHorizontal=0;arrivalOrbit=0;currentRoom=-1;yaw=180;pitch=9;
  Teleport(new Vector3(1,0,10));character.localRotation=Quaternion.Euler(0,180,0);
  if(anim&&!string.IsNullOrEmpty(idleName))anim.Play(idleName);
  UpdateCamera();
 }
 public void BeginVisit(string unused){
  if(!home)return;
  home=false;paused=false;firstPerson=false;character.localRotation=Quaternion.identity;
  #if UNITY_WEBGL && !UNITY_EDITOR
  SerengetiVisitStarted();
  #endif
  NotifyRoom(0);
 }
 public void SetPaused(string value){paused=value=="1";if(paused){touchForward=0;touchHorizontal=0;jumpRequested=false;smoothMove=Vector3.zero;}}
 public void SetMotion(string value){motion=value=="1";}
 public void ChangeView(string unused){if(home)BeginVisit("");firstPerson=!firstPerson;}
 public void Turn(string value){float delta;if(float.TryParse(value,out delta)){if(home)BeginVisit("");yaw=Mathf.Repeat(yaw+delta,360);}}
 public void EnterRoom(string value){
  GetComponent<GalleryCinemaSeat>()?.StandCinema("");
  int room=0;int.TryParse(value,out room);home=false;paused=false;touchForward=0;touchHorizontal=0;
  character.localRotation=Quaternion.identity;firstPerson=room==2;pitch=room==2?-7:9;yaw=room==2?0:180;
  Teleport(room==3?new Vector3(45,0,1f):room==2?new Vector3(1,0,16.5f):room==1?new Vector3(0,0,-17):new Vector3(2,0,8));
  NotifyRoom(room);UpdateCamera();
 }
 void OnApplicationFocus(bool focused){if(!focused){touchForward=0;touchHorizontal=0;runHeld=false;jumpRequested=false;smoothMove=Vector3.zero;paused=true;}}
 void OnApplicationPause(bool value){if(value){touchForward=0;touchHorizontal=0;runHeld=false;jumpRequested=false;smoothMove=Vector3.zero;paused=true;}}
 void Teleport(Vector3 position){verticalVelocity=0;jumpRequested=false;smoothMove=Vector3.zero;controller.enabled=false;transform.position=position;transform.rotation=Quaternion.Euler(0,yaw,0);controller.enabled=true;}
 void NotifyRoom(int room){if(currentRoom==room)return;currentRoom=room;
  #if UNITY_WEBGL && !UNITY_EDITOR
  SerengetiRoomChanged(room);
  #endif
 }
 void Update(){
  foreach(var r in characterRenderers)r.enabled=!firstPerson;
  if(paused){if(anim)anim.enabled=false;return;}if(anim)anim.enabled=motion||!home;
  if(Input.GetMouseButtonDown(0)){pressPosition=Input.mousePosition;dragged=false;}
  if(Input.GetMouseButton(0)&&(Input.mousePosition-pressPosition).sqrMagnitude>36)dragged=true;
  float horizontal=Input.GetAxis("Horizontal")+touchHorizontal,vertical=Input.GetAxis("Vertical")+touchForward;
  if(home&&(Mathf.Abs(horizontal)+Mathf.Abs(vertical)>.01f||Input.GetKeyDown(KeyCode.E)))BeginVisit("");
  Vector2 look=Vector2.zero;
  if(Input.touchCount>0){if(Input.GetTouch(0).phase==TouchPhase.Moved)dragged=true;}
  // Web pointer deltas arrive from the same drag handler for mouse and touch.
  // Native players retain their mouse controls; do not count web drags twice.
  else if(Application.platform!=RuntimePlatform.WebGLPlayer&&(Input.GetMouseButton(1)||(Input.GetMouseButton(0)&&dragged)))look=new Vector2(Input.GetAxis("Mouse X"),Input.GetAxis("Mouse Y"))*2;
  if(home){arrivalOrbit=Mathf.Clamp(arrivalOrbit+look.x,-24,24);}
  else {
   if(Input.GetKeyDown(KeyCode.V))firstPerson=!firstPerson;
   yaw=Mathf.Repeat(yaw+look.x,360);pitch=Mathf.Clamp(pitch-look.y,-60,70);
   var input=Vector3.ClampMagnitude(new Vector3(horizontal,0,vertical),1);
   bool running=runHeld||Input.GetKey(KeyCode.LeftShift)||Input.GetKey(KeyCode.RightShift);
   var target=GalleryNavigation.Direction(new Vector2(input.x,input.z),yaw)*(running?RunSpeed:WalkSpeed);
   smoothMove=Vector3.MoveTowards(smoothMove,target,(input.sqrMagnitude>.001f?6.0f:8.0f)*Time.deltaTime);
   var before=transform.position;
   if(controller.isGrounded&&verticalVelocity<0)verticalVelocity=-2;
   if((jumpRequested||Input.GetKeyDown(KeyCode.Space))&&controller.isGrounded)verticalVelocity=5;
   jumpRequested=false;verticalVelocity-=14*Time.deltaTime;
   controller.Move((smoothMove+Vector3.up*verticalVelocity)*Time.deltaTime);
   if((controller.collisionFlags&CollisionFlags.Above)!=0&&verticalVelocity>0)verticalVelocity=0;
   var travelled=transform.position-before;travelled.y=0;
   float speed=travelled.magnitude/Mathf.Max(Time.deltaTime,.001f);
   bool backwards=firstPerson&&input.z<-.1f&&Mathf.Abs(input.x)<.25f&&!string.IsNullOrEmpty(backwardName);
   if(speed>.025f){
    var facing=Quaternion.LookRotation(backwards?-travelled:travelled,Vector3.up);
    character.rotation=Quaternion.Slerp(character.rotation,facing,1-Mathf.Exp(-12*Time.deltaTime));
   }
   if(anim){
    string n=speed>.025f?(backwards?backwardName:walkName):idleName;
    if(!string.IsNullOrEmpty(n)){
     if(n!=idleName)anim[n].speed=Mathf.Clamp(speed/(backwards?BackwardClipSpeed:ForwardClipSpeed),.05f,6f);
     anim.CrossFade(n,.16f);
    }
   }
   NotifyRoom(transform.position.x>32?3:transform.position.z>15.2f?2:transform.position.z<-8?1:0);
  }
  if(Input.GetMouseButtonUp(0)&&!dragged)Interact(cam.ScreenPointToRay(Input.mousePosition));
 }
 void LateUpdate(){if(paused)return;UpdateCamera();
  #if UNITY_WEBGL && !UNITY_EDITOR
  if(Time.unscaledTime-lastNavigationReport>.2f){lastNavigationReport=Time.unscaledTime;SerengetiNavigation(transform.position.x,transform.position.z,yaw,pitch);}
  #endif
 }
 void UpdateCamera(){
  if(home){
   cam.fieldOfView=75;
   cam.transform.position=transform.position+Quaternion.Euler(0,arrivalOrbit,0)*new Vector3(0,2.4f,4.35f);
   cam.transform.LookAt(new Vector3(0,1.8f,0));return;
  }
  cam.fieldOfView=currentRoom==2?74:64;
  Vector3 head=transform.position+Vector3.up*1.65f;
  Vector3 desired=firstPerson?head:GalleryNavigation.Orbit(head,yaw,pitch);
  if(!firstPerson&&Physics.SphereCast(head,.18f,(desired-head).normalized,out var hit,Vector3.Distance(head,desired),~(1<<9),QueryTriggerInteraction.Ignore))desired=head+(desired-head).normalized*Mathf.Max(.4f,hit.distance-.1f);
  cam.transform.position=desired;cam.transform.rotation=Quaternion.Euler(pitch,yaw,0);
 }
 void Interact(Ray ray){
  if(!Physics.Raycast(ray,out var hit,20,~(1<<9)))return;
  var chair=hit.collider.GetComponentInParent<GalleryCinemaChair>();if(chair){chair.Select();return;}
  var chess=hit.collider.GetComponent<GalleryChessTarget>();if(chess){chess.Select();return;}
   var portal=hit.collider.GetComponent<GalleryPortal>();
  if(portal){if(portal.room==0&&home)BeginVisit("");else EnterRoom(portal.room.ToString());return;}
  var art=hit.collider.GetComponent<GalleryArtwork>();if(!art)return;
  #if UNITY_WEBGL && !UNITY_EDITOR
  SerengetiArtwork(art.index);
  #else
  Debug.Log("Artwork selected: "+art.index);
  #endif
 }
}

// Camera-relative movement remains horizontal even when the camera looks up/down.
public static class GalleryNavigation {
 public static Vector3 Direction(Vector2 axes,float yaw){return Quaternion.Euler(0,yaw,0)*Vector3.ClampMagnitude(new Vector3(axes.x,0,axes.y),1);}
 public static Vector3 Orbit(Vector3 head,float yaw,float pitch){return head+Quaternion.Euler(pitch,yaw,0)*new Vector3(.35f,.2f,-4.3f);}
}
