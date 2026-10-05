using UnityEngine;

public class GalleryDoor : MonoBehaviour {
 public int room;
 void OnTriggerEnter(Collider other){var visitor=other.GetComponent<GalleryVisitor>();if(!visitor)return;if(GalleryVR.Active)other.GetComponent<GalleryVR>()?.GoRoom(room.ToString());else visitor.EnterRoom(room.ToString());}
}
