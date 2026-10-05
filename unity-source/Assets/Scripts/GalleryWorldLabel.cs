using UnityEngine;

// Keep dynamic font atlases in sync while depth-testing text against gallery walls.
[RequireComponent(typeof(TextMesh))]
public class GalleryWorldLabel : MonoBehaviour {
 Material material;
 void OnEnable(){Refresh();Font.textureRebuilt+=OnFontTextureRebuilt;}
 void OnDisable(){Font.textureRebuilt-=OnFontTextureRebuilt;}
 void OnDestroy(){if(material)Destroy(material);}
 void OnFontTextureRebuilt(Font font){if(font==GetComponent<TextMesh>().font)Refresh();}
 public void Refresh(){
  var text=GetComponent<TextMesh>();if(!text.font)return;
  if(!material){material=new Material(Shader.Find("Serengeti/World Text"));GetComponent<Renderer>().sharedMaterial=material;}
  material.mainTexture=text.font.material.mainTexture;
 }
}
