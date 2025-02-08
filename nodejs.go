//go:build wnidows
// +build wnidows

package main

import (
	"fmt"
	"os"
	"os/exec"
)

func main() {
	cmd := exec.Command("node", "nodejs/jslib/main.js")

	// cmd.Dir = ""
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Start()
	if err != nil {
		fmt.Printf("Start exited with error: %s\n", err.Error())
		os.Exit(1)
	}

	err = cmd.Wait()
	if err != nil {
		fmt.Printf("Wait with error: %s\n", err.Error())
		os.Exit(1)
	}
}
