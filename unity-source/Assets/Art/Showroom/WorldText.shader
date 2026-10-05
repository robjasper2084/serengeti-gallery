Shader "Serengeti/World Text" {
 Properties {_MainTex("Font atlas",2D)="white"{}}
 SubShader {
  Tags {"Queue"="Transparent" "RenderType"="Transparent" "IgnoreProjector"="True"}
  Lighting Off Cull Off ZWrite Off ZTest LEqual
  Blend SrcAlpha OneMinusSrcAlpha
  Pass {
   CGPROGRAM
   #pragma vertex vert
   #pragma fragment frag
   #include "UnityCG.cginc"
   sampler2D _MainTex;
   struct vertexInput{float4 vertex:POSITION;float2 uv:TEXCOORD0;fixed4 color:COLOR;};
   struct fragmentInput{float4 vertex:SV_POSITION;float2 uv:TEXCOORD0;fixed4 color:COLOR;};
   fragmentInput vert(vertexInput v){fragmentInput o;o.vertex=UnityObjectToClipPos(v.vertex);o.uv=v.uv;o.color=v.color;return o;}
   fixed4 frag(fragmentInput i):SV_Target{fixed4 c=i.color;c.a*=tex2D(_MainTex,i.uv).a;return c;}
   ENDCG
  }
 }
}
