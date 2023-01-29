# build Library
add_library(NEW_CLASS_NAME NEW_CLASS_NAME.cpp)

target_link_libraries(
  NEW_CLASS_NAME
  pico_stdlib
)

target_include_directories (NEW_CLASS_NAME PUBLIC
	${CMAKE_CURRENT_SOURCE_DIR}
	${CMAKE_CURRENT_BINARY_DIR}
	)