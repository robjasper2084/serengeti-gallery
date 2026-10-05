using UnityEngine;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

// Exercises actual scene colliders before exporting the native player.
public static class GalleryMovementValidation {
 static int mask=~(1<<9);
 static List<string> report;
 public static void Run(){
  report=new List<string>();Physics.SyncTransforms();
  var original=GameObject.Find("Playable portrait visitor").GetComponent<CharacterController>();bool enabled=original.enabled;original.enabled=false;
  var probe=new GameObject("Temporary movement validation");probe.layer=9;
  var body=probe.AddComponent<CharacterController>();body.height=1.78f;body.radius=.34f;body.center=new Vector3(0,.9f,0);body.stepOffset=.15f;
  try{
   foreach(float yaw in new[]{0f,90f,180f,270f}){
    var directions=new[]{Vector2.up,Vector2.right,Vector2.down,Vector2.left,new Vector2(1,1),new Vector2(1,-1),new Vector2(-1,-1),new Vector2(-1,1)};
    foreach(var axis in directions){var direction=GalleryNavigation.Direction(axis,yaw);if(Mathf.Abs(direction.y)>.0001f||Mathf.Abs(direction.magnitude-1)>.001f)throw new Exception("Movement must remain horizontal and normalize diagonals");Walk(body,new Vector3(45,0,1),direction,2,"yaw="+yaw+" axes="+axis);}
   }
   if(Vector3.Distance(GalleryNavigation.Direction(Vector2.up,90),Vector3.right)>.001f||Vector3.Distance(GalleryNavigation.Direction(Vector2.up,180),Vector3.back)>.001f||Vector3.Distance(GalleryNavigation.Direction(Vector2.right,270),Vector3.forward)>.001f)throw new Exception("Movement does not follow camera compass headings");
   var head=new Vector3(45,1.65f,1);var first=GalleryNavigation.Orbit(head,0,9);var last=GalleryNavigation.Orbit(head,360,9);if(Vector3.Distance(first,last)>.001f)throw new Exception("Camera orbit must complete a full 360 degrees");
   foreach(float yaw in new[]{0f,90f,180f,270f})foreach(float pitch in new[]{-60f,9f,70f}){var position=GalleryNavigation.Orbit(head,yaw,pitch);if(Mathf.Abs(Vector3.Distance(head,position)-Vector3.Distance(head,first))>.001f)throw new Exception("Looking up or down must orbit around the hero");}
   report.Add("PASS camera-relative movement: 32 actual controller traversals; diagonal normalization; horizontal travel; full 360-degree camera orbit and vertical orbit");
   Approach(body,new Vector3(2,0,8),GameObject.Find("Life & Light entrance doorway"));
   Approach(body,new Vector3(-16.957f,0,6.184f),GameObject.Find("Life & Light entrance doorway"));
   Approach(body,new Vector3(45,0,1),GameObject.Find("Life & Light return doorway"));
  }finally{UnityEngine.Object.DestroyImmediate(probe);original.enabled=enabled;Directory.CreateDirectory("Logs");File.WriteAllLines("Logs/gallery-movement-validation.txt",report);}
  Debug.Log("GALLERY_MOVEMENT_VALIDATED "+string.Join("; ",report));
 }
 static void Place(CharacterController body,Vector3 position){body.enabled=false;body.transform.position=position+Vector3.up*.04f;body.enabled=true;Physics.SyncTransforms();}
 static void Walk(CharacterController body,Vector3 start,Vector3 direction,float distance,string name){
  Place(body,start);for(int i=0;i<Mathf.CeilToInt(distance*60/2.4f);i++)body.Move((direction*2.4f+Vector3.down*2)/60);
  float progress=Vector3.Dot(body.transform.position-start,direction);if(progress<distance-.15f)throw new Exception("Blocked movement "+name+": "+progress+"m / "+distance+"m");
 }
 static void Approach(CharacterController body,Vector3 start,GameObject doorway){
  if(!doorway)throw new Exception("Missing doorway");
  var door=doorway.GetComponentInChildren<GalleryDoor>();var trigger=door.GetComponent<BoxCollider>();
  if(!trigger.isTrigger||trigger.size.x<2.4f||trigger.size.y<2.8f)throw new Exception("Doorway needs a wide walk-through threshold");
  // Survey an unobstructed route from the arrival point into the threshold.
  var goal=doorway.transform.position-doorway.transform.forward*.5f;
  const float step=.25f;var seed=new Vector2Int(Mathf.RoundToInt(start.x/step),Mathf.RoundToInt(start.z/step));
  var visited=new Dictionary<Vector2Int,Vector2Int>();var floor=new Dictionary<Vector2Int,Vector3>();var queue=new Queue<Vector2Int>();queue.Enqueue(seed);visited[seed]=seed;
  var target=seed;bool found=false;
  while(queue.Count>0&&visited.Count<40000){
   var cell=queue.Dequeue();var p=new Vector3(cell.x*step,3.5f,cell.y*step);
   if(!Physics.Raycast(p,Vector3.down,out var hit,5,mask,QueryTriggerInteraction.Ignore)||hit.normal.y<.7f)continue;
   p.y=hit.point.y+.04f;
   if(p.y<-.2f||p.y>.2f||Physics.CheckCapsule(p+Vector3.up*.44f,p+Vector3.up*1.34f,.43f,mask,QueryTriggerInteraction.Ignore))continue;
   floor[cell]=p;
   if(Vector2.Distance(new Vector2(p.x,p.z),new Vector2(goal.x,goal.z))<.22f){target=cell;found=true;break;}
   foreach(var offset in new[]{Vector2Int.up,Vector2Int.right,Vector2Int.down,Vector2Int.left}){var next=cell+offset;if(visited.ContainsKey(next)||Mathf.Abs(next.x*step-start.x)>25||Mathf.Abs(next.y*step-start.z)>20)continue;visited[next]=cell;queue.Enqueue(next);}
  }
  if(!found){
   foreach(var point in new[]{start,goal}){
    var hits=Physics.RaycastAll(point+Vector3.up*6,Vector3.down,10,mask,QueryTriggerInteraction.Ignore).OrderBy(h=>h.distance).Select(h=>h.collider.name+" y="+h.point.y);
    report.Add("Floor survey "+point+": "+string.Join(", ",hits));
    var blockers=Physics.OverlapCapsule(point+Vector3.up*.55f,point+Vector3.up*1.43f,.34f,mask,QueryTriggerInteraction.Ignore).Select(c=>c.name);report.Add("Body survey "+point+": "+string.Join(", ",blockers));
   }
   report.Add("Reachable floor cells="+floor.Count+" / visited="+visited.Count);throw new Exception("No clear walking route to "+doorway.name);
  }
  var path=new List<Vector3>();for(var cell=target;cell!=seed;cell=visited[cell])path.Add(floor[cell]);path.Reverse();Place(body,start);
  foreach(var point in path){int guard=0;while(Vector2.Distance(new Vector2(body.transform.position.x,body.transform.position.z),new Vector2(point.x,point.z))>.06f){var delta=point-body.transform.position;delta.y=0;body.Move((delta.normalized*2.4f+Vector3.down*2)/60);if(++guard>80)throw new Exception("Controller stuck approaching "+doorway.name+" at "+body.transform.position+" toward "+point);}}
  if(!body.bounds.Intersects(trigger.bounds))throw new Exception("Walking route did not reach the door threshold");
  report.Add("PASS "+doorway.name+": clear floor route and actual controller reaches walk-through trigger, destination room="+door.room);
 }
}
