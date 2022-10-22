#include <stdio.h>
#include "pico/stdlib.h"

int main()
{

    const uint led_pin = 25;

    // Initialize the LED pin
    gpio_init(led_pin);
    gpio_set_dir(led_pin, GPIO_OUT);

    stdio_init_all();

    printf("Hello, world!\n\n");

    while (true)
    {
        // Turn on the LED
        printf("Blinking\r\n");
        gpio_put(led_pin, true);
        sleep_ms(500);

        // Turn off the LED
        gpio_put(led_pin, false);
        sleep_ms(500);
    }
}