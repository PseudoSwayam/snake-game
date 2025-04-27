import pygame
import random
import sys
import copy # Needed to copy the maze template
import math # Needed for mouth drawing

# --- Pygame Initialization ---
pygame.init()

# --- Constants ---
# Grid and Screen
GRID_SIZE = 20
GRID_WIDTH = 30
GRID_HEIGHT = 20
SCREEN_WIDTH = GRID_SIZE * GRID_WIDTH
SCREEN_HEIGHT = GRID_SIZE * GRID_HEIGHT

# Colors (R, G, B)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
PACMAN_YELLOW = (255, 255, 0) # Character color
SNAKE_COLOR = PACMAN_YELLOW
DARK_SNAKE_COLOR = (180, 180, 0) # Character outline color
FOOD_COLOR = (200, 0, 0)
DARK_FOOD_COLOR = (100, 0, 0)
WALL_COLOR = (0, 220, 220)
DARK_WALL_COLOR = (0, 150, 150)
BACKGROUND_COLOR = BLACK
MOUTH_COLOR = BLACK           # Color for the mouth cut-out
RED_TEXT = (200, 0, 0)         # Color for Game Over text
YELLOW_TEXT = PACMAN_YELLOW    # Color for Win text

# Maze Constants
PATH = 0
WALL = 1

# Game Settings
FPS = 6              # SLOW speed
TOTAL_FOOD = 3
EATING_ANIMATION_DURATION = FPS // 2 # Frames mouth stays open
CHARACTER_SIZE_FACTOR = 0.85 # How much of the grid cell the character fills
CHARACTER_BORDER_RADIUS = GRID_SIZE // 4 # How rounded the corners are

# --- Maze Template Provided By User ---
MAZE_TEMPLATE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], # Top Wall
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1], # Upper horizontal section
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1], # Gaps in upper section
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,0,1], # Short vertical walls forming central path
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], # Wide Central Horizontal Path
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], # Snake Starts Near Here
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,0,1], # Lower short vertical walls
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,1], # Lower horizontal section
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  # Bottom Wall
]


# --- Global Variables ---
snake_positions = [] # Path history for collision logic
snake_direction = (0, 0)
food_position = None
maze = []
food_eaten_count = 0
game_state = "playing" # Possible states: "playing", "game_over", "won"
is_eating_animating = False
eating_animation_timer = 0

# --- Pygame Setup ---
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Fixed Pac-Snake!")
clock = pygame.time.Clock()
message_font = pygame.font.Font(None, 50)
small_font = pygame.font.Font(None, 36)

# --- Helper Functions ---
def draw_wall_block(surface, color, outline_color, grid_x, grid_y):
    rect = pygame.Rect(grid_x * GRID_SIZE, grid_y * GRID_SIZE, GRID_SIZE, GRID_SIZE)
    pygame.draw.rect(surface, color, rect)
    pygame.draw.rect(surface, outline_color, rect, 1)

def draw_food_block(surface, color, outline_color, grid_x, grid_y):
    rect = pygame.Rect(grid_x * GRID_SIZE, grid_y * GRID_SIZE, GRID_SIZE, GRID_SIZE)
    pygame.draw.rect(surface, color, rect)
    pygame.draw.rect(surface, outline_color, rect, 1)

def draw_character(surface, head_pos, direction, is_animating):
    char_size = int(GRID_SIZE * CHARACTER_SIZE_FACTOR)
    offset = (GRID_SIZE - char_size) // 2
    px, py = head_pos[0] * GRID_SIZE + offset, head_pos[1] * GRID_SIZE + offset
    char_rect = pygame.Rect(px, py, char_size, char_size)
    center_x, center_y = char_rect.centerx, char_rect.centery
    effective_radius = char_rect.width // 2 - 1

    pygame.draw.rect(surface, SNAKE_COLOR, char_rect, border_radius=CHARACTER_BORDER_RADIUS)

    mouth_angle = math.pi / 5
    base_angle = 0
    if direction == (1, 0): base_angle = 0
    elif direction == (-1, 0): base_angle = math.pi
    elif direction == (0, -1): base_angle = math.pi / 2
    elif direction == (0, 1): base_angle = 3 * math.pi / 2

    if is_animating:
        p1 = (center_x, center_y)
        p2_x = center_x + effective_radius * math.cos(base_angle - mouth_angle)
        p2_y = center_y - effective_radius * math.sin(base_angle - mouth_angle)
        p3_x = center_x + effective_radius * math.cos(base_angle + mouth_angle)
        p3_y = center_y - effective_radius * math.sin(base_angle + mouth_angle)
        pygame.draw.polygon(surface, MOUTH_COLOR, [p1, (p2_x, p2_y), (p3_x, p3_y)])

    pygame.draw.rect(surface, DARK_SNAKE_COLOR, char_rect, width=1, border_radius=CHARACTER_BORDER_RADIUS)

def generate_maze():
    return copy.deepcopy(MAZE_TEMPLATE)

def place_food(snake_path_history, current_maze):
    possible_locations = []
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            if current_maze[y][x] == PATH:
                possible_locations.append((x, y))

    while True:
        if not possible_locations: return (1,1) # Fallback
        food_pos = random.choice(possible_locations)
        if food_pos not in snake_path_history: return food_pos
        else:
            possible_locations.remove(food_pos)
            if not possible_locations: return (1,1) # Avoid infinite loop


def reset_game():
    global snake_positions, snake_direction, food_position
    global food_eaten_count, maze, game_state
    global is_eating_animating, eating_animation_timer

    print("Resetting game...")

    start_x, start_y = GRID_WIDTH // 2, GRID_HEIGHT // 2 # Start center
    # Ensure start is valid path in the *specific* template
    while MAZE_TEMPLATE[start_y][start_x] == WALL:
        start_y += 1
        if start_y >= GRID_HEIGHT - 1: start_y = 1; break

    initial_body = [(start_x, start_y)]
    for i in range(1, 3):
         prev_x = start_x - i
         if 0 <= prev_x < GRID_WIDTH and MAZE_TEMPLATE[start_y][prev_x] == PATH:
              initial_body.append((prev_x, start_y))
         else: break

    snake_positions = initial_body
    snake_direction = (1, 0) # Start right
    maze = generate_maze()
    food_position = place_food(snake_positions, maze)
    food_eaten_count = 0
    is_eating_animating = False
    eating_animation_timer = 0
    game_state = "playing" # CRITICAL: Reset state back to playing

# --- Initial Game Setup ---
reset_game()

# --- Game Loop ---
running = True
while running:

    # --- 1. Handle Events ---
    # This section ALWAYS runs
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False # Exit the main loop
        elif event.type == pygame.KEYDOWN:
            # Check game state BEFORE checking key
            if game_state == "game_over" or game_state == "won":
                if event.key == pygame.K_SPACE:
                    print("SPACE pressed - Resetting game") # Debug print
                    reset_game()
            elif game_state == "playing":
                # Handle movement input ONLY if playing
                current_dx, current_dy = snake_direction
                if event.key == pygame.K_UP and current_dy == 0: snake_direction = (0, -1)
                elif event.key == pygame.K_DOWN and current_dy == 0: snake_direction = (0, 1)
                elif event.key == pygame.K_LEFT and current_dx == 0: snake_direction = (-1, 0)
                elif event.key == pygame.K_RIGHT and current_dx == 0: snake_direction = (1, 0)

    # --- Handle Eating Animation Timer ---
    if is_eating_animating:
        eating_animation_timer -= 1
        if eating_animation_timer <= 0:
            is_eating_animating = False

    # --- 2. Update Game State ---
    # This section ONLY runs if game_state is "playing"
    if game_state == "playing":
        current_head = snake_positions[0]
        dx, dy = snake_direction
        new_head_x = current_head[0] + dx
        new_head_y = current_head[1] + dy
        new_head = (new_head_x, new_head_y)

        # Collision Checks
        hit_edge = (new_head_x < 0 or new_head_x >= GRID_WIDTH or
                    new_head_y < 0 or new_head_y >= GRID_HEIGHT)
        hit_maze_wall = False
        if not hit_edge:
            if maze[new_head_y][new_head_x] == WALL: hit_maze_wall = True
        else: hit_maze_wall = True

        hit_self = False
        if len(snake_positions) > 1:
             if new_head in snake_positions[1:]: hit_self = True

        # --- Set Game Over State ---
        if hit_maze_wall or hit_self:
            print(f"Collision detected! Setting game_state to 'game_over'") # Debug print
            game_state = "game_over" # Change state
            # --- IMPORTANT: Do NOT do anything else here (like stopping loop).
            # The loop will continue to the drawing phase.
        else:
            # --- No Collision: Update Position & Handle Food ---
            snake_positions.insert(0, new_head) # Add new head

            if new_head == food_position: # Ate food
                food_eaten_count += 1
                is_eating_animating = True
                eating_animation_timer = EATING_ANIMATION_DURATION
                # Don't pop tail (path grows)

                if food_eaten_count >= TOTAL_FOOD: # Check win condition
                    print("Win condition met! Setting game_state to 'won'") # Debug print
                    game_state = "won"
                    food_position = None
                else:
                    food_position = place_food(snake_positions, maze) # Place new food
            else: # Didn't eat food
                snake_positions.pop() # Pop tail


    # --- 3. Draw Everything ---
    # This section ALWAYS runs, drawing depends on game_state
    screen.fill(BACKGROUND_COLOR)

    # Draw Maze Walls
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            if maze[y][x] == WALL:
                draw_wall_block(screen, WALL_COLOR, DARK_WALL_COLOR, x, y)

    # Draw Character Head (Only if game not over/won, or draw based on last pos?)
    # Let's draw it always based on current snake_positions[0] for simplicity
    if snake_positions:
        head_pos = snake_positions[0]
        # Pass False for animation if game is over/won to show closed mouth
        draw_character(screen, head_pos, snake_direction, is_eating_animating and game_state=="playing")

    # Draw Food (Only if game is playing and food exists)
    if game_state == "playing" and food_position:
        draw_food_block(screen, FOOD_COLOR, DARK_FOOD_COLOR, food_position[0], food_position[1])

    # Draw Score Text
    score_surf = small_font.render(f"Food: {food_eaten_count} / {TOTAL_FOOD}", True, WHITE)
    screen.blit(score_surf, (10, 10))

    # --- Draw Game Over / Win Messages ---
    # This section only draws messages if state matches
    if game_state == "game_over":
        text_surf = message_font.render("GAME OVER!", True, RED_TEXT)
        text_rect = text_surf.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 40))
        screen.blit(text_surf, text_rect)
        score_text_end = small_font.render(f"Food Eaten: {food_eaten_count}", True, WHITE)
        score_rect = score_text_end.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
        screen.blit(score_text_end, score_rect)
        play_again_surf = small_font.render("Press SPACE to Play Again", True, WHITE)
        play_again_rect = play_again_surf.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 40))
        screen.blit(play_again_surf, play_again_rect)
        # print("Drawing Game Over Screen") # Debug print

    elif game_state == "won":
        text_surf = message_font.render("YOU WIN!", True, YELLOW_TEXT)
        text_rect = text_surf.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 - 40))
        screen.blit(text_surf, text_rect)
        play_again_surf = small_font.render("Press SPACE to Play Again", True, WHITE)
        play_again_rect = play_again_surf.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2 + 40))
        screen.blit(play_again_surf, play_again_rect)
        # print("Drawing Win Screen") # Debug print

    # --- 4. Update Display ---
    pygame.display.flip() # Show the drawn frame

    # --- 5. Control Game Speed ---
    clock.tick(FPS) # Maintain desired frame rate

# --- End of Game Loop ---
print("Exiting game...") # Should only print when window is closed
pygame.quit()
sys.exit()