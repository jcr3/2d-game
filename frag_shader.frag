#version 330 core

uniform sampler2D tex; // main game display
uniform sampler2D noise; // height map png
uniform float windowX;
uniform float windowY;
uniform float time;

in vec2 uvs;
out vec4 fragColor;

vec4 blurSampler(sampler2D originalTex){
    float Pi = 6.28318530718; // Pi*2
    
    // GAUSSIAN BLUR SETTINGS {{{
    float Directions = 16.0; // BLUR DIRECTIONS (Default 16.0 - More is better but slower)
    float Quality = 3.0; // BLUR QUALITY (Default 4.0 - More is better but slower)
    float Size = 8.0; // BLUR SIZE (Radius)
    
    vec2 Radius = vec2(Size/windowX, Size/windowY);

    // smear uvs to make grass blades and get color
    vec2 modified_uvs = vec2(uvs.x + 0.25 * sin(uvs.y * 80 + time * 0.02), uvs.y + 0.75 * sin(uvs.x * 100 + time * 0.03));
    vec4 Color = texture(originalTex, modified_uvs);

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

vec4 applyVignette(vec4 originalColor)
{   
    vec2 windowSize = vec2(windowX, windowY);
    vec2 position = (gl_FragCoord.xy / windowSize) - vec2(0.5);   
    float dist = length(position);

    float radius = 0.65;
    float softness = 0.2;
    float vignette = smoothstep(radius, radius - softness, dist);

    vec4 color = vec4(originalColor.rgb - (1.0 - vignette) * 0.15, 1.0);

    return color;
}

void main(){

    // choose color tint depending on height
    vec4 heightMap = blurSampler(noise);
    float height = heightMap.r - 0.1;

    vec3 shadowTint1 = vec3(0.95, 0.95, 1.0);
    vec3 shadowTint2 = vec3(0.9, 0.9, 0.95);
    vec3 highlightTint1 = vec3(1.2, 1.1, 0.9);
    vec3 highlightTint2 = vec3(1.3, 1.2, 1);

    if ( height < 0.1){
        fragColor = vec4((texture(tex, uvs).rgb) * shadowTint1, 1.0);
    }
    else if ( height < 0.35){
        fragColor = vec4((texture(tex, uvs).rgb) * shadowTint2, 1.0);
    }
    else if (height < 0.6){
        fragColor = vec4((texture(tex, uvs).rgb), 1.0);
    }
    else if (height < 0.85) {
        fragColor = vec4((texture(tex, uvs).rgb) * highlightTint1, 1.0);
    }
    else {
        fragColor = vec4((texture(tex, uvs).rgb) * highlightTint2, 1.0);
    }

    // add vignette
    fragColor = applyVignette(fragColor);
}