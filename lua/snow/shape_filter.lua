local snow = require "snow.snow"

---@class AssistEnv: Env
---@field strokes table<string, string>
---@field radicals table<string, string>
---@field radical_map table<string, string>
---@field hint string?
---@field hint_type string?
---@field stroke_map table<string, string>
---@field reverse_stroke_map table<string, string>

--- split a UTF-8 string into a list of characters, and lookup each character in a map
---@param element string
---@param map table<string, string>
local function encode(element, map)
  local result = ""
  for _, c in utf8.codes(element) do
    local character = utf8.char(c)
    local value = map[character]
    if value then
      result = result .. value
    end
  end
  return result
end

local function table_from_tsv(path)
  ---@type table<string, string>
  local result = {}
  local file = io.open(path, "r")
  if not file then
    return result
  end
  for line in file:lines() do
    ---@type string, string
    local character, content = line:match("([^\t]+)\t([^\t]+)")
    if not content or not character then
      goto continue
    end
    result[character] = content
    ::continue::
  end
  file:close()
  return result
end

local filter = {}

---@param env AssistEnv
function filter.init(env)
  local config = env.engine.schema.config
  local dir = rime_api.get_user_data_dir() .. "/lua/snow/"
  env.strokes = table_from_tsv(dir .. "strokes.txt")
  local radicals_file = config:get_string("speller/radicals")
  env.radicals = table_from_tsv(dir .. radicals_file)
  local radical_map_file = config:get_string("speller/radical_map")
  env.radical_map = table_from_tsv(dir .. radical_map_file)
  env.hint_type = config:get_string("speller/hint_type")
  env.hint = config:get_string("speller/hint_shape")
  env.stroke_map = {}
  env.reverse_stroke_map = {}
  local raw = config:get_map("speller/strokes")
  if not raw then return end
  for _, key in ipairs(raw:keys()) do
    local value = raw:get_value(key)
    if value then
      local value_str = value:get_string()
      env.stroke_map[key] = value_str
      env.reverse_stroke_map[value_str] = key
    end
  end
end

---@param translation Translation
---@param env AssistEnv
function filter.func(translation, env)
  local context = env.engine.context
  local shape_input = context:get_property("shape_input")
  -- 有形码输入，进行过滤
  if shape_input:len() > 0 then
    for candidate in translation:iter() do
      local element = ""
      local code = ""
      local prompt = ""
      local comment = ""
      local partial_code = ""
      if shape_input:sub(1, 1) == "1" then
        partial_code = shape_input:sub(2)
        element = env.radicals[candidate.text] or ""
        code = encode(element, env.radical_map)
        prompt = " 部首 [" .. partial_code .. "]"
        comment = code .. " " .. element
      else
        partial_code = shape_input
        element = env.strokes[candidate.text] or ""
        code = encode(element, env.stroke_map)
        prompt = " 笔画 [" .. partial_code:gsub(".", env.reverse_stroke_map) .. "]"
        comment = code
      end
      if not code or code:sub(1, #partial_code) == partial_code then
        candidate.comment = comment
        candidate.preedit = candidate.preedit .. prompt
        yield(candidate)
      end
    end
  else
    local current = snow.current(env.engine.context)
    -- 仅提示不过滤
    if env.hint and env.hint_type and current and rime_api.regex_match(current, env.hint) then
      for candidate in translation:iter() do
        if env.hint_type == "stroke" then
          local element = env.strokes[candidate.text] or ""
          local code = encode(element, env.stroke_map)
          candidate.comment = code
        elseif env.hint_type == "radical" then
          local element = env.radicals[candidate.text] or ""
          local code = encode(element, env.radical_map)
          candidate.comment = code .. " " .. element
        end
        yield(candidate)
      end
    else
      for candidate in translation:iter() do
        yield(candidate)
      end
    end
  end
end

return filter
