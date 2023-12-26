import pygame, sys
import moderngl, array

from gen_height_map import generateNoiseTex

def main():
    pygame.init()

    windowX = 800
    windowY = 600

    window = pygame.display.set_mode((windowX, windowY), pygame.OPENGL | pygame.DOUBLEBUF)
    display = pygame.Surface((windowX, windowY))
    ctx = moderngl.create_context()

    clock = pygame.time.Clock()
    
    generateNoiseTex(120, 90, 0, 0) # create noise tex as png file
    img = pygame.image.load('img.png')

    quad_buffer = ctx.buffer(data=array.array('f', [
        # x,    y,    u,    v,
        -1.0,  1.0,  0.0,  0.0, # top right
        1.0,  1.0,  1.0,  0.0, # top left
        -1.0, -1.0,  0.0,  1.0, # bottom left
        1.0, -1.0,  1.0,  1.0, # bottom right
    ]))

    with open("vert_shader.vert") as vs:
        vert_shader = str(vs.read())

    with open("frag_shader.frag") as fs:
        frag_shader = str(fs.read())

    program = ctx.program(vertex_shader=vert_shader, fragment_shader=frag_shader)
    render_object = ctx.vertex_array(program, [(quad_buffer, '2f 2f', 'vert', 'texcoord')])

    def surf_to_texture(surf):
        tex = ctx.texture(surf.get_size(), 4)
        tex.filter = (moderngl.NEAREST, moderngl.NEAREST)
        tex.swizzle = 'BGRA'
        tex.write(surf.get_view('1'))
        return tex
    
    hmSurf = pygame.Surface((1600, 1200))
    
    while True:
        display.fill((154, 205, 50))

        hmSurf.blit(img, (0, 0))

        hm_tex = surf_to_texture(hmSurf)
        hm_tex.use(1)
        program['noise'] = 1

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
        
        frame_tex = surf_to_texture(display)
        frame_tex.use(0)
        program['tex'] = 0

        program['windowX'] = windowX
        program['windowY'] = windowY
        
        render_object.render(mode=moderngl.TRIANGLE_STRIP)

        pygame.display.flip()
        
        hm_tex.release()
        frame_tex.release()

        clock.tick(60)

if __name__ == "__main__":
    main()