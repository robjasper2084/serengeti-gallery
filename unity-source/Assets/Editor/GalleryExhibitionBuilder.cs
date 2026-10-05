using UnityEngine;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEditor.Build.Reporting;
using System.IO;
using System.Linq;

// Adds a separate hall to the existing scene; never recreates the restored gallery.
public static class GalleryExhibitionBuilder {
 [System.Serializable] public class Item {public int index; public string id,title,credit,group,texture; public int width,height;}
 [System.Serializable] public class Catalog {public Item[] items;}
 static Transform root; static Material stone,brass,ink;
 static GameObject Box(string name,Vector3 p,Vector3 s,Material m,bool solid=true){var g=GameObject.CreatePrimitive(PrimitiveType.Cube);g.name=name;g.transform.SetParent(root);g.transform.position=p;g.transform.localScale=s;g.GetComponent<Renderer>().sharedMaterial=m;if(!solid)Object.DestroyImmediate(g.GetComponent<Collider>());return g;}
 static TextMesh Label(string words,Vector3 p,float size,float yaw=0){var t=new GameObject(words).AddComponent<TextMesh>();t.transform.SetParent(root);t.transform.position=p;t.transform.rotation=Quaternion.Euler(0,yaw,0);t.font=Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");t.GetComponent<Renderer>().sharedMaterial=t.font.material;t.fontSize=48;t.characterSize=size;t.anchor=TextAnchor.MiddleCenter;t.alignment=TextAlignment.Center;t.text=words;t.color=new Color(.78f,.63f,.39f);return t;}
 static void Artwork(Item item,Vector3 p,float yaw,float maxW=2.5f,float maxH=1.85f){
  var importer=AssetImporter.GetAtPath(item.texture) as TextureImporter;
  importer.maxTextureSize=1024;importer.isReadable=false;importer.mipmapEnabled=true;importer.textureCompression=TextureImporterCompression.Compressed;importer.SaveAndReimport();
  var texture=AssetDatabase.LoadAssetAtPath<Texture2D>(item.texture);float ratio=(float)item.width/item.height,w=maxW,h=w/ratio;if(h>maxH){h=maxH;w=h*ratio;}
  var display=new GameObject("Life & Light / "+item.title);display.transform.SetParent(root);display.transform.position=p;display.transform.rotation=Quaternion.Euler(0,yaw,0);
  var backing=Box(item.title+" backing",Vector3.zero,new Vector3(w+.12f,h+.12f,.08f),ink,false);backing.transform.SetParent(display.transform,false);backing.transform.localPosition=new Vector3(0,0,.07f);
  var art=GameObject.CreatePrimitive(PrimitiveType.Quad);art.name=item.title;art.transform.SetParent(display.transform,false);art.transform.localScale=new Vector3(w,h,1);art.AddComponent<GalleryArtwork>().index=item.index;
  var mat=new Material(Shader.Find("Unlit/Texture"));mat.mainTexture=texture;art.GetComponent<Renderer>().sharedMaterial=mat;
  foreach(float sign in new[]{-1f,1f}){
   var vertical=Box("Brass frame",Vector3.zero,new Vector3(.035f,h+.1f,.055f),brass,false);vertical.transform.SetParent(display.transform,false);vertical.transform.localPosition=new Vector3(sign*(w/2+.027f),0,-.025f);
   var horizontal=Box("Brass frame",Vector3.zero,new Vector3(w+.1f,.035f,.055f),brass,false);horizontal.transform.SetParent(display.transform,false);horizontal.transform.localPosition=new Vector3(0,sign*(h/2+.027f),-.025f);
  }
  var caption=Label(item.title+"\n"+item.credit,p+Quaternion.Euler(0,yaw,0)*new Vector3(0,-h/2-.22f,-.05f),.019f,yaw);
 }
 static void Portal(string name,Vector3 p,float yaw,int room){var portal=Box(name,p,new Vector3(2.4f,1.05f,.12f),ink);portal.transform.rotation=Quaternion.Euler(0,yaw,0);portal.AddComponent<GalleryPortal>().room=room;Label(name,p+Quaternion.Euler(0,yaw,0)*Vector3.back*.08f,.05f,yaw);}
 public static void Build(){
  // Release from a separate scene: keep older local photography work recoverable.
  var source=EditorSceneManager.OpenScene("Assets/Scenes/Serengeti.unity");
  EditorSceneManager.SaveScene(source,"Assets/Scenes/LifeAndLight.unity",true);
  EditorSceneManager.OpenScene("Assets/Scenes/LifeAndLight.unity");
  var oldPhotos=GameObject.Find("Eyefilmlife photographs / added 2026-10-04");
  if(oldPhotos)Object.DestroyImmediate(oldPhotos);
  var previous=GameObject.Find("Life & Light photography hall");if(previous)Object.DestroyImmediate(previous);
  var original=Object.FindObjectsByType<GalleryArtwork>(FindObjectsSortMode.None).OrderBy(a=>a.index).ToArray();
  if(original.Length!=33||!original.Select(a=>a.index).SequenceEqual(Enumerable.Range(0,33)))throw new System.Exception("Expected the established 33 artwork indices before adding this exhibition");
  var originalPositions=original.Select(a=>a.transform.position).ToArray();
  root=new GameObject("Life & Light photography hall").transform;
  stone=new Material(Shader.Find("Standard"));stone.color=new Color(.54f,.51f,.45f);stone.SetFloat("_Glossiness",.12f);
  brass=new Material(Shader.Find("Standard"));brass.color=new Color(.67f,.47f,.23f);brass.SetFloat("_Metallic",.6f);
  ink=new Material(Shader.Find("Standard"));ink.color=new Color(.055f,.07f,.06f);
  Box("Exhibition solid floor",new Vector3(45,-.16f,0),new Vector3(24,.32f,22),stone);
  Box("North photography wall",new Vector3(45,2.6f,-11),new Vector3(24,5.2f,.25f),stone);
  Box("South photography wall",new Vector3(45,2.6f,11),new Vector3(24,5.2f,.25f),stone);
  Box("West portrait wall",new Vector3(33,2.6f,0),new Vector3(.25f,5.2f,22),stone);
  Box("East abstract wall",new Vector3(57,2.6f,0),new Vector3(.25f,5.2f,22),stone);
  Box("Exhibition ceiling",new Vector3(45,5.3f,0),new Vector3(24,.2f,22),ink,false);
  var catalog=JsonUtility.FromJson<Catalog>(File.ReadAllText("Assets/Art/LifeAndLight/Catalog.json"));
  int light=0,people=0,companions=0;
  foreach(var item in catalog.items){
   if(item.group=="light")Artwork(item,new Vector3(36+light++*3,2.35f,-10.78f),180);
   else if(item.group=="people")Artwork(item,new Vector3(33.22f,2.35f,-7+people++*3.5f),270);
   else if(item.group=="companions")Artwork(item,new Vector3(35.2f+companions++*2.8f,2.35f,10.78f),0,2.35f,1.85f);
   else Artwork(item,new Vector3(56.78f,2.35f,0),90,3.4f,3.4f);
  }
  Label("DETROIT & LIGHT",new Vector3(45,4.35f,-10.7f),.065f,180);
  Label("PEOPLE & ROOTS",new Vector3(33.3f,4.35f,0),.065f,270);
  Label("COMPANIONS & PLACES",new Vector3(45,4.35f,10.7f),.065f);
  Label("ABSTRACT ENERGY",new Vector3(56.7f,4.4f,0),.065f,90);
  foreach(float x in new[]{39f,51f})foreach(float z in new[]{-5f,5f}){var lamp=new GameObject("Exhibition warm light").AddComponent<Light>();lamp.transform.SetParent(root);lamp.transform.position=new Vector3(x,4.5f,z);lamp.type=LightType.Point;lamp.range=15;lamp.intensity=1.5f;lamp.color=new Color(1,.9f,.74f);lamp.shadows=LightShadows.None;}
  Portal("Return to gallery",new Vector3(56.72f,2.2f,6),90,0);
  Portal("Life & Light photography",new Vector3(16,2.2f,11),0,3);
  Label("eyefilmlife: Detroit, Life & Light\n21 artist-supplied works | Original credits preserved",new Vector3(45,4.75f,-10.68f),.035f,180);
  Physics.SyncTransforms();var floor=GameObject.Find("Exhibition solid floor").GetComponent<Collider>();if(!floor.Raycast(new Ray(new Vector3(45,2,1f),Vector3.down),out var hit,3))throw new System.Exception("Exhibition spawn floor missing");
  if(root.GetComponentsInChildren<GalleryArtwork>().Length!=21)throw new System.Exception("Expected 21 exhibition displays");
  var complete=Object.FindObjectsByType<GalleryArtwork>(FindObjectsSortMode.None).OrderBy(a=>a.index).ToArray();
  if(complete.Length!=54||!complete.Select(a=>a.index).SequenceEqual(Enumerable.Range(0,54)))throw new System.Exception("Expected exactly 54 unique displayed artwork indices");
  for(int i=0;i<original.Length;i++)if(original[i].transform.position!=originalPositions[i])throw new System.Exception("Existing artwork moved");
  EditorSceneManager.MarkSceneDirty(root.gameObject.scene);EditorSceneManager.SaveOpenScenes();AssetDatabase.SaveAssets();
  PlayerSettings.WebGL.compressionFormat=WebGLCompressionFormat.Brotli;PlayerSettings.WebGL.decompressionFallback=true;PlayerSettings.WebGL.dataCaching=true;
  var result=BuildPipeline.BuildPlayer(new BuildPlayerOptions{scenes=new[]{"Assets/Scenes/LifeAndLight.unity"},locationPathName="Builds/LifeAndLight",target=BuildTarget.WebGL});
  if(result.summary.result!=BuildResult.Succeeded)throw new System.Exception("Exhibition WebGL build failed");
  Debug.Log("LIFE_AND_LIGHT_BUILD_SUCCESS original=33 added=21 total=54 unique indices; preserved existing positions; verified solid spawn floor");
 }
}
