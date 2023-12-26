#version 330 core

uniform sampler2D tex; // main game display
uniform sampler2D noise; // height map png
uniform float windowX;
uniform float windowY;

in vec2 uvs;
out vec4 fragColor;

vec4 blurSampler(sampler2D originalTex){
    float Pi = 6.28318530718; // Pi*2
    
    // GAUSSIAN BLUR SETTINGS {{{
    float Directions = 16.0; // BLUR DIRECTIONS (Default 16.0 - More is better but slower)
    float Quality = 3.0; // BLUR QUALITY (Default 4.0 - More is better but slower)
    float Size = 8.0; // BLUR SIZE (Radius)
    
    vec2 Radius = vec2(Size/windowX, Size/windowY);

    // Pixel colour
    vec4 Color = texture(originalTex, uvs);

    // Blur calculations
    for( float d=0.0; d<Pi; d+=Pi/Directions)
    {
        for(float i=1.0/Quality; i<=1.0; i+=1.0/Quality)
        {
            Color += texture( originalTex, uvs+vec2(cos(d),sin(d))*Radius*i);		
        }
    }

    Color /= Quality * Directions - 15.0;
    return Color;
}

vec4 applyVignette(vec4 originalTex)
{   
    vec2 windowSize = vec2(windowX, windowY);
    vec2 position = (gl_FragCoord.xy / windowSize) - vec2(0.5);   
    float dist = length(position);

    float radius = 0.5;
    float softness = 0.15;
    float vignette = smoothstep(radius, radius - softness, dist);

    vec4 color = vec4(originalTex.rgb - (1.0 - vignette), 1.0);

    return color;
}

void main(){
    
    vec4 water = vec4(0.031, 0.663, 0.8, 1.0);
    vec4 beach = vec4(0.929, 0.863, 0.604, 1.0);

    vec4 heightMap = applyVignette(blurSampler(noise));
    float height = heightMap.r - 0.1;

    if ( height < 0.3 ){
        fragColor = water;
    }
    else if ( height < 0.45){
        fragColor = beach;
    }
    else if ( height < 0.8){
        fragColor = vec4(texture(tex, uvs).rgb, 1.0);
    }
    else{
        fragColor = vec4(texture(tex, uvs).rg * 0.8, texture(tex, uvs).b * 0.7, 1.0);
    }
}