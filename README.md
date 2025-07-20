# Understanding Bézier Curve

> 베지에 곡선 원리 한국어로 읽기: https://romantech.net/1330  
> Bézier Curve Playground: https://romantech.github.io/bezier-curve

In CSS, timing functions (acceleration curves) are used to control animations or transition effects. A timing function is a mathematical function that determines how quickly or slowly an animation starts and ends. Simply put, it controls the change in speed of an animation.

If you are using Tailwind CSS, you can apply various acceleration curves using predefined utility classes such as `ease-in`, `ease-out`, and `ease-in-out`.

```html
<!-- 
transition-timing-function: cubic-bezier(0.4, 0, 1, 1); 
transition-duration: 300ms;
-->
<button class="ease-in duration-300 ...">Button A</button>
```

For example, `ease` provides a smooth start and end (a common acceleration curve), while `ease-in` is used for an effect that starts slowly and ends quickly.

In fact, `ease`, `ease-in`, `ease-out`, and `ease-in-out` are timing function (easing function) presets provided by default in CSS. Each value is predefined with a cubic-bezier curve as shown below.

```css
ease           /* cubic-bezier(0.25, 0.1, 0.25, 1) */
ease-in        /* cubic-bezier(0.42, 0, 1, 1) */
ease-out       /* cubic-bezier(0, 0, 0.58, 1) */
ease-in-out    /* cubic-bezier(0.42, 0, 0.58, 1) */
...
```

A Bézier curve is a mathematical curve used in computer graphics to represent smooth curves, defined by a set of points called control points. Given `n` control points, a Bézier curve of degree `n-1` can be created. Image via [JavaScript Info](https://javascript.info/bezier-curve#control-points).

![bezier-curves.png](/public/images/bezier-curves.png)

The [cubic-bezier()](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/cubic-bezier) function used in CSS is based on a cubic (3rd-degree) Bézier curve, which consists of four control points ($P_0, P_1, P_2, P_3$). Among these, the starting point ($P_0$) and the ending point ($P_3$) are always fixed at (0, 0) and (1, 1), respectively. Therefore, in practice, you only set the two intermediate control points, $P_1$ and $P_2$, directly.

```css
/* Used in the format: cubic-bezier(P1.x, P1.y, P2.x, P2.y) */
transition: width 1s cubic-bezier(0.12, 0.83, 0.92, 1);

/* The x-coordinate (duration) must be within the [0, 1] range */
cubic-bezier(0.25, 0.1, 0.75, 1.0) /* ✅ */
cubic-bezier(1.5, 0.1, 0.75, 1.0)  /* ❌ */

/* The y-coordinate (progress) can exceed the [0, 1] range, creating a bouncing effect if it does */
cubic-bezier(0.1, -0.6, 0.2, 2.0)
```

On the other hand, Bézier curves can be constructed using de Casteljau's algorithm. It is based on a process of connecting the given control points with line segments, and then finding new points by dividing each segment at the same ratio $t$ (internal division, or linear interpolation). The operation of dividing a line segment between two points by a specific ratio $t$ is called internal division or linear interpolation.

By repeating this linear interpolation until only one point remains, the final point becomes a coordinate on the Bézier curve. In other words, de Casteljau's algorithm is a method that calculates points on the curve by recursively applying linear interpolation.

Since this may be difficult to understand from the text alone, let's build a quadratic Bézier curve step by step.

**Interpolation (插值, Interpolation)**

Interpolation refers to any process of inferring unknown values that lie between known data points. For example, if a value is $0$ at $x=0$ and $100$ at $x=10$, the process of estimating the values in between, such as for $x=3$ or $x=7$, is interpolation.

**Linear Interpolation (线性插值, Linear Interpolation)**

Linear interpolation is the most representative and simple of these interpolation techniques. It works by assuming two known points are connected by a straight line and then calculating an intermediate value on that line. It is often shortened to Lerp. For reference, the term "linear" refers to the form of a straight line.

## Quadratic Bézier Curve

First, connect the three control points `A`, `B`, and `C` with straight lines. This creates two line segments: `AB` and `BC`.

![quadratic-bezier-curve-01.png](/public/images/quadratic-bezier-curve-01.png)

Divide each line segment by the same ratio `t` (where $0 \le t \le 1$). For example, if `t` is 0.3, a point `D` is formed 30% of the way from `A` to `B`, and a point `E` is formed 30% of the way from `B` to `C`.

![quadratic-bezier-curve-02.png](/public/images/quadratic-bezier-curve-02.png)

Connect points `D` and `E` with a straight line to create a new line segment `DE`.

![quadratic-bezier-curve-03.png](/public/images/quadratic-bezier-curve-03.png)

On this new segment, find point `F` by moving along it by the same ratio `t`. Since `F` is the only point remaining, this point becomes a coordinate on the Bézier curve.

![quadratic-bezier-curve-04.png](/public/images/quadratic-bezier-curve-04.png)

By repeating the process above while gradually increasing the `t` value from 0 to 1 (e.g., 0.05, 0.1, ..., 0.95, 1), multiple points are generated. Connecting these points in order completes the quadratic Bézier curve.

![quadratic-bezier-curve-05.png](/public/images/quadratic-bezier-curve-05.png)

Let's see how a quadratic Bézier curve is drawn through the GIF image below.

![Quadratic Bézier Curve Animation](/public/images/quadratic-bezier-curves-animation.gif)

## Cubic Bézier Curve

A cubic Bézier curve consists of four control points. The basic principle of creating the curve is the same as for a quadratic Bézier curve, but since there is one additional control point, the linear interpolation process is repeated one more time.

First, connect the four control points `A`, `B`, `C`, and `D` with straight lines.

![cubic-bezier-curve-01.png](/public/images/cubic-bezier-curve-01.png)

Divide each of the line segments `AB`, `BC`, and `CD` by the same ratio `t`.

![cubic-bezier-curve-02.png](/public/images/cubic-bezier-curve-02.png)

Connect the resulting points `E`, `F`, and `G` to form new line segments `EF` and `FG`.

![cubic-bezier-curve-03.png](/public/images/cubic-bezier-curve-03.png)

Again, divide the new line segments by `t` to create points `H` and `I`.

![cubic-bezier-curve-04.png](/public/images/cubic-bezier-curve-04.png)

Connect the resulting points with a straight line to create the segment `HI`.

![cubic-bezier-curve-05.png](/public/images/cubic-bezier-curve-05.png)

Divide the segment again by the ratio `t` to find point `J`. Since only one point remains, this point becomes a coordinate on the Bézier curve.

![cubic-bezier-curve-06.png](/public/images/cubic-bezier-curve-06.png)

Let's see how a cubic Bézier curve is drawn through the GIF image below.

![Cubic Bézier Curve Animation](/public/images/cubic-bezier-curves-animation.gif)

## Understanding the Bézier Curve's Mathematical Formula

### 1st-Degree Bézier Curve (2 Control Points)

A 1st-degree Bézier curve (2 control points) can be expressed by the mathematical formula below — this is the linear interpolation formula.

$$
P = (1-t)P_1 + tP_2
$$

$P_1$ is the start point, $P_2$ is the end point, and $t$ is the progress (a value from 0 to 1, where 0 is the start and 1 is the destination). $P$ represents the position along the path from $P_1$ to $P_2$ according to $t$.

For example, when $t = 0$, $P$ coincides exactly with $P_1$.

$$
\begin{aligned}
t &= 0 \\
P &= (1–0)P_1 + 0 \cdot P_2 \\
&= 1 \cdot P_1 + 0 \\
&= P_1
\end{aligned}
$$

$t = 0.3$ signifies a point that has moved 30% of the total distance from the start point $P_1$ toward the end point $P_2$. The position of this point, $P$, can be calculated using a weighted average. A weighted average assigns a greater weight to the point that is closer. When $t = 0.3$, $P$ is 30% of the distance away from $P_1$ and 70% of the distance away from $P_2$, so it is closer to $P_1$. Therefore, by applying a 70% weight to $P_1$ and a 30% weight to $P_2$, we arrive at the formula $P = 0.7 \cdot P_1 + 0.3 \cdot P_2$.

$$
\begin{aligned}
t &= 0.3 \\
P &= (1 - 0.3)P_1 + 0.3 \cdot P_2 \\
&= 0.7 \cdot P_1 + 0.3 \cdot P_2
\end{aligned}
$$

When $t = 1$, $P$ coincides exactly with $P_2$.

$$
\begin{aligned}
t &= 1 \\
P &= (1 - 1)P_1 + 1 \cdot P_2 \\
&= 0 \cdot P_1 + 1 \cdot P_2 \\
&= 0 + P_2 \\
&= P_2
\end{aligned}
$$

The formula for a 1st-degree Bézier curve (linear interpolation) can be expanded as follows for a more intuitive representation.

$$
\begin{aligned}
P &= P_1-tP_1+tP_2 \\
&= P_1+tP_2-tP_1 \\
&= P_1+t(P_2-P_1)
\end{aligned}
$$

### 2nd-Degree (Quadratic) Bézier Curve (3 Control Points)

When there are three control points, the formula is as follows. This is a recursive application of the principle behind the 1st-degree Bézier curve, so the fundamental concept is the same.

Let's examine step-by-step how the formula below is derived.

$$
P = (1 - t)^2 P_1 + 2(1 - t)t P_2 + t^2 P_3
$$

First, let's assume we have the three control points needed for a quadratic Bézier curve—a start point $P_1$, a middle point $P_2$, and an end point $P_3$. Using these three points, we create two dynamic points.

- Point $Q_1$, which moves from $P_1$ to $P_2$: $Q_1 = (1-t)P_1+tP_2$
- Point $Q_2$, which moves from $P_2$ to $P_3$: $Q_2 = (1-t)P_2+tP_3$

As the parameter $t$ varies from 0 to 1, $Q_1$ moves linearly from $P_1$ to $P_2$, and $Q_2$ moves linearly from $P_2$ to $P_3$. The final point $P$ on the quadratic Bézier curve can be obtained by performing another linear interpolation on these two moving points, $Q_1$ and $Q_2$, with respect to $t$. In other words, we are creating another 1st-degree Bézier curve with $Q_1$ as the start point and $Q_2$ as the end point.

$$
P = (1-t)Q_1 + tQ_2
$$

Now, let's substitute the definitions of $Q_1$ and $Q_2$ into the formula above.

$$
\begin{aligned}
P &= (1-t){Q_1} + {tQ_2} \\
&= (1-t)((1-t)P_1 + tP_2) + t((1-t)P_2 + tP_3)
\end{aligned}
$$

Expand the multiplication using the distributive property.

$$
P = (1-t)(1-t)P_1 + (1-t)tP_2 + t(1-t)P_2 + t \cdot tP_3
$$

Rearrange the expression using powers (²).

$$
P = (1-t)^2P_1 + (1-t)tP_2 + t(1-t)P_2 + t^2P_3
$$

The two middle $P_2$ terms are identical (like terms), differing only in the order of multiplication, so they are combined into one. This completes the formula for the quadratic Bézier curve.

$$
P = (1-t)^2P_1 + 2(1-t)tP_2 + t^2P_3
$$

Higher-order Bézier curves, such as cubic and quartic curves, are created by recursively applying the same principle mentioned above.

For reference, terms like $(1-t)^2$, $2(1-t)t$, and $t^2$ that are multiplied in front of each control point are called Bernstein basis polynomials. These terms determine how much influence (weight) each control point has on the point $P$ on the curve, depending on the value of $t$.

## Slope of Bézier Curves

Below are examples of various Bézier curves. Image via [Josh Collins Worth](https://joshcollinsworth.com/demos/easing).

![Easing Examples](/public/images/easing-example.gif)

In a Bézier curve graph, the x-axis represents the flow of time (duration), and the y-axis represents the progress of the animation. In this context, the slope of the curve represents the velocity at that moment. Therefore, a steeper slope can create the effect of faster movement, while a gentler slope results in slower movement. Image via [Josh Collins Worth](https://joshcollinsworth.com/blog/easing-curves).

![Curve Illustrated](/public/images/curve-illustrated.png)

While the x-axis must always be specified within the 0 to 1 range, as it represents the total animation duration normalized to 1, the y-axis can be used to create a bounce effect by utilizing a pattern that overshoots the target value of 1 and then returns.

```
[0 → 0.5 → 0.8] →   [1.1]   → [0.95 → 1.02 → 0.98] → [1.0]
  Acceleration    Overshoot          Bounce         Settled
```

1. Acceleration Phase (0 → 0.8): The object speeds up as the slope increases.
2. Overshoot (1.1): When the y-value reaches 1.1, the velocity momentarily becomes 0 before the direction of motion is reversed.
3. Bounce (0.95 → 1.02 → 0.98): The phase where the y-value oscillates up and down several times around the target value.
4. Settling (1.0): The phase where the object reaches the target value and stops.

For example, you can create an overshoot effect by using a setting like `cubic-bezier(0.34, 1.56, 0.64, 1)`. For reference, an "Overshoot" is a movement that intentionally goes past the target point (1) and then returns. Conversely, an "Undershoot" refers to a movement that goes backward past the starting point (0) before heading toward the target point.
