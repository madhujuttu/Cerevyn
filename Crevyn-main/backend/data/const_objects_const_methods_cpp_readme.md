# Const Objects and Const Member Functions in C++ (Complete Interview Guide)

## 1. Introduction

`const` correctness is a very important concept in C++. It ensures that objects which are declared as constant cannot be accidentally modified. Understanding how **const objects**, **const member functions**, **const pointers**, **const references**, and **function overloading with const** work together is a common interview topic.

This guide explains the concepts step‑by‑step with practical examples.

---

# 2. Const Objects

A **const object** is an object whose state cannot be modified after creation.

Example:

```cpp
class BankAccount {
private:
    std::string name;
    float balance;

public:
    BankAccount(std::string name, float balance)
        : name(name), balance(balance) {}

    std::string get_name() const {
        return name;
    }

    float get_balance() const {
        return balance;
    }
};

int main()
{
    const BankAccount account("Harry", 7345.33f);

    std::cout << account.get_name() << std::endl;
    std::cout << account.get_balance() << std::endl;
}
```

## Important Rule

When an object is declared as **const**, only **const member functions** can be called on that object.

---

# 3. Why Getter Methods Must Be Const

Getter functions do not modify the object. Therefore they should be marked `const`.

Example:

```cpp
std::string get_name() const;
float get_balance() const;
```

### Meaning

The keyword `const` after the function means:

> "This function will not modify any member variables of the object."

Internally the compiler treats it like this:

```
const BankAccount *this
```

So the object is treated as constant inside the function.

---

# 4. What Happens If Getter Is NOT Const?

Example:

```cpp
std::string get_name();
```

Now try this:

```cpp
const BankAccount account("Harry", 7345.33);
account.get_name();
```

This produces a **compile error**.

Reason:

```
non‑const member function cannot be called on const object
```

Because the compiler assumes the function **might modify the object**.

---

# 5. What Happens If We Try To Modify Data Inside Const Method

Example:

```cpp
float get_balance() const
{
    balance = 0;   // ERROR
    return balance;
}
```

Compilation error occurs because **const functions cannot modify data members**.

---

# 6. Calling Non‑Const Method From Const Method

Example:

```cpp
class Test
{
public:

    void update()
    {
        std::cout << "Update called";
    }

    void show() const
    {
        update();   // ERROR
    }
};
```

Reason:

Inside a const function:

```
this pointer becomes

const Test* this
```

So only const functions can be called.

---

# 7. Overloading Const and Non‑Const Member Functions

C++ allows two versions of a function:

- const version
- non const version

Example:

```cpp
class BankAccount {

private:
    std::string name;

public:

    std::string get_name() const
    {
        return name;
    }

    std::string& get_name()
    {
        return name;
    }
};
```

### How It Works

If object is:

```
const object
```

compiler calls:

```
const version
```

If object is:

```
non‑const object
```

compiler calls:

```
non‑const version
```

---

# 8. Returning References (Scenario From Your Example)

Example from the image scenario.

```cpp
std::string& get_name();
float& get_balance();
```

These functions return **references**.

Meaning the caller can modify the internal data.

Example:

```cpp
BankAccount harry("Harry", 7345.33);

harry.get_name() = "Harry Smith";
harry.get_balance() = 10000.0f;
```

Here the returned reference directly modifies the object's data.

### Output

```
Harry Smith
10000
```

This is why we need two versions:

```
const version → read only
non const version → allow modification
```

---

# 9. Const Pointers

There are three main pointer const combinations.

## Pointer to const

```cpp
const int *ptr;
```

Meaning:

```
value cannot change
pointer can change
```

Example

```cpp
int a = 10;
int b = 20;

const int *ptr = &a;

ptr = &b;   // allowed
*ptr = 30;  // error
```

---

## Const pointer

```cpp
int *const ptr = &a;
```

Meaning

```
pointer cannot change
value can change
```

---

## Const pointer to const data

```cpp
const int *const ptr = &a;
```

Meaning

```
pointer cannot change
value cannot change
```

---

# 10. Const References

Const references prevent modification of objects.

Example

```cpp
void display(const BankAccount& acc)
{
    std::cout << acc.get_name();
}
```

Advantages:

- avoids copying objects
- prevents modification

---

# 11. mutable Keyword

Sometimes we want a variable to change even inside const functions.

For this we use `mutable`.

Example

```cpp
class Logger
{
private:

    mutable int access_count = 0;

public:

    void log() const
    {
        access_count++;
    }
};
```

Here `access_count` can change even in const functions.

Used for:

- caching
- debugging counters

---

# 12. const_cast

`const_cast` is used to remove constness from a variable.

Example

```cpp
void update(const int* p)
{
    int* modifiable = const_cast<int*>(p);
    *modifiable = 20;
}
```

⚠ This is **dangerous** if the original object was truly const.

It should only be used when necessary.

---

# 13. Interview Summary

Important rules:

1. Const objects can only call const member functions
2. Const functions cannot modify data members
3. Const functions cannot call non const functions
4. Function overloading allows const and non const versions
5. Returning references allows direct modification of members

---

# Final Conclusion

Const correctness is essential for writing safe and predictable C++ programs. By correctly using const objects, const member functions, references, and pointers, programmers can prevent accidental modification of data while still allowing controlled access when necessary.

