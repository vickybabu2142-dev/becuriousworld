# BeCurious World — Layout and Routing Rules

These rules ensure that wire rendering, particle flow animations, and bulb glow effects remain clean, non-overlapping, and physically correct as the circuit builder scales (e.g., to support series and parallel combinations).

## 1. Symmetrical Orthogonal Routing
When routing wires between components on the canvas:
- **Perpendicular 90-Degree Layouts:** Wires must exit terminals in their natural directions (vertical for battery, horizontal for resistors and bulbs) and transition around corners using orthogonal segments.
- **Corner Fillets:** Round all orthogonal wire corners with a smooth quadratic Bezier fillet (16px radius) to prevent sharp corners and make the schematic visually clean.
- **Symmetrical/Opposite Channel Lanes:** Wires must run in opposite lanes to form a clear loop and prevent overlapping.
  - Wires connected to the positive battery terminal (`pos`) exit vertically up and route through the upper horizontal lane (`y = battery-pos.y - 30`).
  - Wires connected to the negative battery terminal (`neg`) exit vertically down and route through the lower horizontal lane (`y = battery-neg.y + 30`).
  - Keep the horizontal segments of parallel wires separated by routing them along their respective vertical extreme boundaries, completely avoiding crossings or overlapping with components.

## 2. Loop-Based Current Direction & Animation
To ensure that animated current flow particles always represent physical current flow:
- **Dynamic Path Traversal:** Compute the circuit's loop path dynamically starting from the battery's positive terminal (+), traversing through intermediate components (resistor, bulb) in order, and ending at the negative terminal (-).
- **Endpoint Orientation:** Determine each wire's path start and end points dynamically based on their index order in the loop path. Orient the wire so it goes from the terminal closer to positive to the terminal closer to negative.
- **Flow Invariance:** Animated particles must flow along this path direction to guarantee the visual flow of current always runs from Live ($+$) $\rightarrow$ Bulb/Resistor $\rightarrow$ Neutral ($-$), completing the loop physically, regardless of the sequence or direction in which the user draws the wires.

## 3. High-Dynamic-Range Bulb Glow
- **Color Temperature Shifts:** Light bulb filament and globe illumination should scale dynamically using HSL gradients based on brightness (0-100%).
- **Visual Range:** Scale the glow color temperature from a warm, dim red-orange (low voltage/high resistance) to a brilliant yellow/white-hot glow (high voltage/low resistance) to provide rich, visual feedback to the user.
